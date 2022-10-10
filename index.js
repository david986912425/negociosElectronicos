var inputFile = document.querySelector('#file');
const button = document.querySelector('#button');
var ArchivoXML = null;
var dropArea = document.querySelector('.c_captura');
var inputContainer = document.querySelector('.c_subir');
var btnsData = document.querySelector('.btns-data');
var dataContainer = document.querySelector('.data-container');
var dowloaderContainer = document.querySelector('.dowloader-container');
var TABLA = document.querySelector('#table')


button.addEventListener('click', () => {
    console.log('TABLA clicked');
    if (ArchivoXML) {
        CargarXMLNEW();
        inputContainer.style.display = "none"
        btnsData.style.display = "flex";
        dataContainer.style.display = "flex";
        dowloaderContainer.style.display = "flex";
        
        console.log('abre');

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

    let nropedido = DocumentoXML.getElementsByTagName("cbc:ID")[2].childNodes[0].nodeValue;
    let fechaFactura = DocumentoXML.getElementsByTagName("cbc:IssueDate")[0].childNodes[0].nodeValue;
    let refer = DocumentoXML.getElementsByTagName("cbc:ID")[0].childNodes[0].nodeValue;
    let fechaContab = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    let texto = DocumentoXML.getElementsByTagName("cbc:Description")[0].childNodes[0].nodeValue;
    let valorVenta = parseFloat(DocumentoXML.getElementsByTagName("cbc:TaxableAmount")[0].childNodes[0].nodeValue).toFixed(2);
    var IGV = parseFloat(valorVenta*0.18).toFixed(2); //Aca se calcula el IGV
    let importeTotal = parseFloat(valorVenta)+parseFloat(IGV);  //Aca se calcula el Importe Total
    var detraccion = parseFloat(importeTotal*0.12).toFixed(2); //Aca se calcula el detraccion
    let importe = parseFloat(DocumentoXML.getElementsByTagName("cbc:Amount")[0].childNodes[0].nodeValue).toFixed(2); //Aca se calcula el importe
    console.log('detraccion:'+ (detraccion+IGV));


    



    let arrayData = [nropedido, fechaFactura, refer, fechaContab, valorVenta, IGV,importeTotal, detraccion, importe,texto];

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
