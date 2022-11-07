var inputFile = document.querySelector('#file');
const button = document.querySelector('#button');
var ArchivoXML = null;
var dropArea = document.querySelector('.c_captura');
var inputContainer = document.querySelector('.c_subir');
var btnsData = document.querySelector('.btns-data');
var dataContainer = document.querySelector('.data-container');
var dowloaderContainer = document.querySelector('.dowloader-container');
var TABLA = document.querySelector('#table')
var ruc = [];

button.addEventListener('click', () => {
    
    if (ArchivoXML) {
        CargarXMLNEW();
        inputContainer.style.display = "none"
        btnsData.style.display = "flex";
        dataContainer.style.display = "flex";
        dowloaderContainer.style.display = "flex";

    } else {
        console.log('no abre');
        return
    }
});

function CargarData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            CargarXML(this);
        }
    };
    xhttp.open("GET", "datos.xml", true);
    xhttp.send();
}

function ExportarTablaAExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Especificar Nombre del Archivo
    filename = filename?filename+'.xls':'excel_factura_data.xls';
    
    // Crear elemento de enlace de descarga
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Crear un enlace al archivo
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Configuracion del nombre del archivo
        downloadLink.download = filename;
        
        //activacion de la funcion
        downloadLink.click();
    }
}

const CargarXML = (xml) => {
    let DocumentoXML = xml;

    let currentDate = new Date();
    let importe = parseFloat(DocumentoXML.getElementsByTagName("cbc:Amount")[0].childNodes[0].nodeValue).toFixed(2);
    let nropedido = DocumentoXML.getElementsByTagName("cbc:ID")[2].childNodes[0].nodeValue;
    let fechaFactura = DocumentoXML.getElementsByTagName("cbc:IssueDate")[0].childNodes[0].nodeValue;
    let refer = DocumentoXML.getElementsByTagName("cbc:ID")[0].childNodes[0].nodeValue;
    let fechaContab = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    let texto = DocumentoXML.getElementsByTagName("cbc:Description")[0].childNodes[0].nodeValue;
    let valorVenta = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxableAmount")[0].childNodes[0].nodeValue).toFixed(2); //Aca se calcula el importe
    var IGV = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxAmount")[0].childNodes[0].nodeValue).toFixed(2);
    let importeTotal = parseFloat(DocumentoXML.getElementsByTagName("cbc:PayableAmount")[0].childNodes[0].nodeValue).toFixed(2);
    var detraccion = 0;
    var retencion = 0;
    var importeConRetencion = 0;
    var boolRet = "NO";
    var motivoRet = "SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN";
    
    let rucid = DocumentoXML.getElementsByTagName("cac:PartyIdentification")[0].children[0].innerHTML;
    console.log(rucid);
    
    if (IGV > 0) {

        detraccion = parseFloat(importeTotal*0.12).toFixed(2);
        
        if (importeTotal > 700) {
            fetch('RUCELECTRONICOS.json')
            .then(data => data.json())
            .then(data=> {
                ruc = data;
                
                const resultado = ruc.filter(function(data){
                    
                    if ( data.Ruc == rucid){
                        return true;
                    }
                    
                });

                if(resultado.length > 0){
                    console.log('Si se encuentra en el Padron de retencion,entonces no se debe cobrar retencion');
                }else{
                    console.log('No se encuentra en el Padron de retencion,entonces si se debe cobrar retencion');

                    boolRet = "SI";
                    retencion = importeTotal * 0.03;
                    importeConRetencion = importeTotal + retencion;
                    motivoRet = "NO SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN";
                }
            });
        }
    } else{
        console.log('No se le aplica retencion ni detracción');
        motivoRet = "SIN IGV";
    }
    
    
    

    let arrayData = [nropedido, fechaFactura, refer, fechaContab, valorVenta, IGV,importeTotal, detraccion, importe, texto, boolRet, motivoRet, importeConRetencion, retencion];

    let dataHTML = document.querySelector('.data-right');
    let dataHTML2 = document.querySelector('.data-left');
    let dataTable = document.querySelector('#data');
    let inputMotivoRet = document.querySelector('#motRetencion');
    let inputMotivoRet2 = document.querySelector('#motRetencion2');
    let inputImporteRetencion = document.querySelector('#importeRetencion');
    let inputImporteRetencion2 = document.querySelector('#importeRetencion2');
    let inputPorcentajeRetencion = document.querySelector('#PorcentajeRetencion');
    let inputPorcentajeRetencion2 = document.querySelector('PporcentajeRetencion2');

    dataHTML.innerHTML = "";
    dataTable.innerHTML = "";

    if (arrayData[10] == "NO") {
        for (let i = 0; i < arrayData.length - 2; i++) {
            dataHTML.innerHTML += `
                <div class="value">
                    ${arrayData[i]}
                </div>
            `
            dataTable.innerHTML += `
                <td>
                    ${arrayData[i]}
                </td>
            `
        }

        inputImporteRetencion.remove();
        inputImporteRetencion2.remove();
        inputPorcentajeRetencion.remove();
        inputPorcentajeRetencion2.remove();
    } else {
        for (let i = 0; i < arrayData.length; i++) {
            if (i != 10) {
                dataHTML.innerHTML += `
                <div class="value">
                    ${arrayData[i]}
                </div>
            `
            dataTable.innerHTML += `
                <td>
                    ${arrayData[i]}
                </td>
            `
            }
        }

        inputMotivoRet.remove();
        inputMotivoRet2.remove();
    }
}


const CargarXMLNEW = async () => {
    let reader = new FileReader();
    reader.readAsText(ArchivoXML);
    reader.onloadend = function () {
        let XMLData = reader.result;
        let parser = new DOMParser();
        let xmlDOM = parser.parseFromString(XMLData, 'application/xml');
        CargarXML(xmlDOM);
    }
    
}

const remover = () => {
    inputContainer.style.display = "none"
    dropArea.style.display = "flex"
    ArchivoXML = null
}

const restablecer = () => {
    dropArea.style.display = "flex"
    ArchivoXML = null
    btnsData.style.display = "none"
    dataContainer.style.display = "none"
    button.style.display = "block"
}


inputFile.addEventListener('change', (e) => {
    ArchivoXML = e.target.files[0]
    dropArea.style.display = "none"
    inputContainer.style.display = "block"
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dd-select');
});
dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.classList.remover('dd-select');
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    let files = e.dataTransfer.files;
    if (files.length != 1) {
        return
    }
    ArchivoXML = files[0]
    dropArea.style.display = "none"
    inputContainer.style.display = "block"
});
