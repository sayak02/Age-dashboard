const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

const cors = require('cors');
app.use(cors());

//creating connection to db
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "tables",
})
//connect to db
db.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('MySql connected')
    }
})

app.get("/",(req,res) =>{
    res.sendFile(__dirname+"/index.html");
})

// let sumArray = [];

//For the dropdowns
app.get('/orgGroup', (req, res) => {
    let sql = `
    SELECT DISTINCT OrgGroup FROM newdata
    `;
    db.query(sql, (error, result) => {
        if (error) {
            throw error;
        }else{
        const result1 = result;
        console.log(result1[0].OrgGroup);
        res.json(result);
        
        let sum = " ";
        // result1.forEach( function(item){
        // // sum = sum+item.OrgGroup;
        // sumArray.push(item.OrgGroup);
        // JSON.stringify(sumArray)
        // })
        console.log(sumArray);
        }
})
});

app.get('/masterGroup', (req, res) => {
    let sql = `
    SELECT DISTINCT MasterGroup FROM newdata
    `;
    db.query(sql, (error, result) => {
        if (error) throw error;
        res.json(result);
    })
});

app.get('/groups', (req, res) => {
    let sql = `
    SELECT DISTINCT newGroup FROM newdata
    `;
    db.query(sql, (error, result) => {
        if (error) throw error;
        res.json(result);
    })
});

//Queries
app.post("/",(req,res) => {
    console.log(req.body.OrgGroup);
    console.log(req.body.masterGroup);
    console.log(req.body.groups);
    let agingGrandTotal = `\`Ageing Grand Total\``;
    let lessTwoWeeks = `\`<Two weeks\``;
    let greaterTwoWeeks = `\`>Two weeks\``;
    let oneMonth = `\`>One Month\``;
    let greaterThreeMonths = `\`>3 Months\``;

let orgsql = `select OrgGroup,SUM(${agingGrandTotal}),SUM(${lessTwoWeeks}),SUM(${greaterTwoWeeks}),SUM(${oneMonth}),SUM(${greaterThreeMonths}) from newdata
where OrgGroup IN ('${req.body.OrgGroup}')
and MasterGroup IN ('${req.body.masterGroup}')
and NewGroup IN ('${req.body.groups}')
group by OrgGroup`;
//FIRST ROW CHART QUERY
db.query(orgsql,(error,orgResult) => {
    // console.log(orgsql);
    if(error) throw error;
    let orgmastersql = `select OrgGroup,MasterGroup,SUM(${agingGrandTotal}),SUM(${lessTwoWeeks}),SUM(${greaterTwoWeeks}),SUM(${oneMonth}),SUM(${greaterThreeMonths}) from newdata
    where OrgGroup IN ('${req.body.OrgGroup}')
    and MasterGroup IN ('${req.body.masterGroup}')
    and NewGroup IN ('${req.body.groups}')
    group by OrgGroup,MasterGroup`;
    //SECOND ROW CHART QUERY
    db.query(orgmastersql,(error,orgMasterResult)=> {
        // console.log(orgmastersql);
        if(error) throw error;
        let orggroupsql = `select OrgGroup,NewGroup,SUM(${agingGrandTotal}),SUM(${lessTwoWeeks}),SUM(${greaterTwoWeeks}),SUM(${oneMonth}),SUM(${greaterThreeMonths}) from newdata
        where OrgGroup IN ('${req.body.OrgGroup}')
        and MasterGroup IN ('${req.body.masterGroup}')
        and NewGroup IN ('${req.body.groups}')
        group by OrgGroup,NewGroup`;
        //THIRD ROW CHART QUERY
        db.query(orggroupsql,(error,orgGroupResult) => {
            // console.log(orggroupsql);
            if(error) throw error;
            res.json({ 'orgData' : orgResult, 'orgMasterData' : orgMasterResult, 'orgGroupData' : orgGroupResult });
            console.log(orgResult,orgMasterResult,orgGroupResult)
        })
    })
});
})

app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
});

