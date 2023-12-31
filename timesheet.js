var Excel = require('exceljs');
const { response } = require('express');
const sendEmail = require('./outlook.js');
const { default: axios } = require('axios');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
var bodyParser = require('body-parser');
var path = require("path");

module.exports = fillExcelTimesheet;

var reqRes = null

async function fillExcelTimesheet(res, data, date, datesList, location) {
    reqRes = res
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile('timesheet.xlsx')
    .then(function() {
        const sheetName = workbook.worksheets[0].name;
        let location = 
        writeTheSelectedSheet(sheetName, workbook, data, date,datesList, location);
    });
    
}



async function writeTheSelectedSheet(sheetName, workbook,data, date, datesList, location) {

    
    const sheetRows = ['D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27','D28',
    'I13','I14','I15','I16','I17','I18','I19','I20','I21','I22','I23','I24','I25','I26','I27']

    const sheetDaysRows = ['C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26', 'C27','C28',
    'H13','H14','H15','H16','H17','H18','H19','H20','H21','H22','H23','H24','H25','H26','H27']

    var worksheet = workbook.getWorksheet(sheetName);
    

    var cellArray = []
    for (let i=0; i<data.length; i++){
    
        let day = getDayName(datesList[i]);
        worksheet.getCell(sheetDaysRows[i]).value = day;
        worksheet.getCell(sheetRows[i]).value = data[i];

        if(location == "UAE") {
            if(day == "Sat" || day == "Sun") {
                cellArray.push(sheetDaysRows[i]);
            }        
        } else {
            if(day == "Fri" || day == "Sat") {
                cellArray.push(sheetDaysRows[i]);
            }
        }
    }

    let cells = [];
    for(let i=0; i<cellArray.length; i++) {
        if(cellArray[i].includes('C')){
            cells.push(`B${cellArray[i].split('C')[1]}`);
            cells.push(`D${cellArray[i].split('C')[1]}`);
            cells.push(`E${cellArray[i].split('C')[1]}`);
            cells.push(`F${cellArray[i].split('C')[1]}`);
        }

        if(cellArray[i].includes('H')){
            cells.push(`G${cellArray[i].split('H')[1]}`);
            cells.push(`I${cellArray[i].split('H')[1]}`);
            cells.push(`J${cellArray[i].split('H')[1]}`);
            cells.push(`K${cellArray[i].split('H')[1]}`);
        }
    }
    const combinedArray = cells.concat(cellArray);


    for(let i=0; i<combinedArray.length; i++) {
        const cell = worksheet.getCell(combinedArray[i]); 
        const style = {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ffff00' },
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true, 
            },
            border : {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
              }
          };
        cell.style = style;
    }
    worksheet.name = date
    worksheet.getCell('I9').value = date;
    worksheet.getCell('I10').value = location;
    await workbook.xlsx.writeFile('file.xlsx')

    await delay(3000);
    reqRes.redirect('/success');
    

    // reqRes.status(200).json({ succeess: 'Timesheet excel file has been created!' });
  }

  function getDayName(dateStr)
{
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).substring(0, 3);        
}
