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
    var DocumentoXML = xml;

    var currentDate = new Date();
    var importe = parseFloat(DocumentoXML.getElementsByTagName("cbc:Amount")[0].childNodes[0].nodeValue).toFixed(2);
    var nropedido = DocumentoXML.getElementsByTagName("cbc:ID")[2].childNodes[0].nodeValue;
    var fechaFactura = DocumentoXML.getElementsByTagName("cbc:IssueDate")[0].childNodes[0].nodeValue;
    var refer = DocumentoXML.getElementsByTagName("cbc:ID")[0].childNodes[0].nodeValue;
    var fechaContab = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    var texto = DocumentoXML.getElementsByTagName("cbc:Description")[0].childNodes[0].nodeValue;
    var valorVenta = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxableAmount")[0].childNodes[0].nodeValue).toFixed(2); //Aca se calcula el importe
    var IGV = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxAmount")[0].childNodes[0].nodeValue).toFixed(2);
    var importeTotal = parseFloat(DocumentoXML.getElementsByTagName("cbc:PayableAmount")[0].childNodes[0].nodeValue).toFixed(2);
    var resdectracion = parseFloat(importeTotal)-parseFloat(importe);
    var importeConRetencion = 0;
    var boolRet = "NO";
    var motivoRet = "asdsdasd";
    var detraccion = "NO HAY DETRACCION";
    var tipo = "";

    var invoiceType = DocumentoXML.getElementsByTagName("cbc:InvoiceTypeCode")[0].childNodes[0].nodeValue;

    console.log(invoiceType);

    if (invoiceType == "01") {

        var rucid = DocumentoXML.getElementsByTagName("cac:PartyIdentification")[0].children[0].innerHTML;
        console.log(rucid);

        tipo = "FACTURA";

        var valorVenta = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxableAmount")[3].childNodes[0].nodeValue).toFixed(2); //Aca se calcula el importe

        if (importeTotal > 700) {
            fetch('RUCELECTRONICOS.json')
            .then(data => data.json())
            .then(data=> {
                ruc = data;
                
                const resultado = ruc.filter(function(data){
                    
                    if (data.Ruc == rucid){
                        return true;
                    }
                    
                });

                var resultsFetch = [];

                if(resultado.length > 0){
                    console.log('Si se encuentra en el Padron de retencion,entonces no se debe cobrar retencion');
                    detraccion = parseFloat(importeTotal * 0.12).toFixed(2);
                    motivoRet = "SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN";
                    document.getElementsByClassName("value")[11].innerHTML = 'SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN';
                    document.getElementsByClassName("value")[12].innerHTML = 'SE EXONERA';
                    if (resdectracion==0){
                        detraccion = "NO HAY DETRACCION";
                        document.getElementsByClassName("value")[8].innerHTML = 'NO HAY DETRACCION';

                    }
                }else{
                    console.log('No se encuentra en el Padron de retencion,entonces si se debe cobrar retencion');
                    boolRet = "SI";
                    retencion = parseFloat(importeTotal * 0.03).toFixed(2);
                    motivoRet = "NO SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN";
                    document.getElementsByClassName("value")[11].innerHTML = 'NO SE ENCUENTRA EN EL PADRÓN DE RETENCIÓN';
                    retencion = importeTotal*0.03
                    document.getElementsByClassName("value")[12].innerHTML = retencion.toFixed(2);
                    var resultado2 = (parseFloat(resdectracion)-parseFloat(retencion)).toFixed(2)
                    console.log(resultado2)
                    if (resultado2 == 0){
                        document.getElementsByClassName("value")[8].innerHTML = 'NO HAY DETRACCION';

                    }else{
                        document.getElementsByClassName("value")[8].innerHTML = resultado2;
                    }
                }
            });
            
        } else if (invoiceType == "03"){
            console.log('No se le aplica retencion ni detracción');
            motivoRet = "SIN IGV";
        }
        
    } else {
        valorVenta = importeTotal;
        //valorVenta = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxableAmount")[0].childNodes[0].nodeValue).toFixed(2);
        tipo = "RECIBO POR HONORARIO";
        console.log('NO HAY DETRACCION');
        document.getElementsByClassName("value")[8].innerHTML == "NO HAY";
    }
        
    //if (fechavencimiento != undefined && fechavencimiento != null) {

        
    //}
    
    let arrayData = [nropedido,tipo , fechaFactura, refer, fechaContab, valorVenta, IGV,importeTotal, detraccion, importe, texto, boolRet, importeConRetencion];

    let dataHTML = document.querySelector('.data-right');
    let dataTable = document.querySelector('#data');
    dataHTML.innerHTML = "";
    dataTable.innerHTML = "";


    for (let i = 0; i < arrayData.length; i++) {
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
