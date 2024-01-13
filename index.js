import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"9865416980",
  post:5432
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted(){
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries=[];
  result.rows.forEach((code)=>{
    countries.push(code.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs",{ countries:countries , total : countries.length});
});

app.post('/add',async(req,res)=>{
  try{
    const added_country = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%'|| $1 || '%'",[req.body["country"].toLowerCase()]);

      const data = added_country.rows[0].country_code;
      try{
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[data]);
        res.redirect("/");
      }catch(err){
        const country = await checkVisisted();
        res.render("index.ejs",{countries: country , total: country.length, error:"The input is already entered"});
      }
  }catch(err){
    const country = await checkVisisted();
    res.render("index.ejs",{countries: country , total: country.length, error:"The input is doesn't exist."});
  }
  
});

app.post('/restart',async(req,res)=>{
    try{
      await db.query("DELETE country_code FROM visited_countries");
    const country = await checkVisisted();
    res.render("index.ejs",{countries: country , total: country.length});
    }catch(err){
      console.log(err);
    }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
