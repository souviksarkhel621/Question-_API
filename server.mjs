//jshint esversion:6
import fetch from 'node-fetch';
import express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import https from 'https';
import bodyParser from 'body-parser';
const app = express();
app.set('view engine', 'ejs');
//app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/questionDB", {useNewUrlParser: true});

const questionSchema = {
  givenquestion: String,
  choice1: String,
  choice2:String,
  choice3:String,
  choice4:String,
  answer:String
};

const Question = mongoose.model("Question", questionSchema);
/////////////////////////////////////Post Question Request///
app.post("/questions",function(req,res){
  const Id = req.body.id;
  fetch(`https://docs.google.com/spreadsheets/d/${Id}/gviz/tq?tqx=out:json`)
      .then(res => res.text())
      .then(text => {
          const json = JSON.parse(text.substr(47).slice(0, -2))
          const rows = json.table.rows;
          for(const row of rows)
          {
            const valrow=row.c;
            const qas = [];
            for(const vals of valrow)
            {qas.push(String(vals.v));}
            Question.findOne({
              givenquestion: qas[0]
            }, function(err, foundQuestion) {
              if (err) {
                console.log(err);
              } else {
                if (foundQuestion)
                {

                }
                else {
                  var newQuestion = new Question({
                    givenquestion:qas[0],
                    choice1: qas[1],
                    choice2:qas[2],
                    choice3:qas[3],
                    choice4:qas[4],
                    answer:qas[5]
                  })
                  newQuestion.save(function(err) {
                    if (err) {
                      console.log(err);
                    } else {

                    }
                  });
                }
              }})
          }
          res.send("Yayy! Questions are added Successfully.");

      })

})
/////////////////////// Show All Questions
app.get("/questions",function(req,res)
{
  Question.find(function(err, foundArticles){
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})
///////////////////////////Delete Specific Question
app.delete("/deletequestion",function(req, res)
{
  Question.deleteOne(
    {givenquestion:req.body.qname},
    function(err){
      if (!err){
        res.send("Successfully deleted the Question.");
      } else {
        res.send(err);
      }
    }
  );
});

/////////////////////////////Delete All Articles
app.delete("/questions",function(req, res){

  Question.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all questions.");
    } else {
      res.send(err);
    }
  });
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
