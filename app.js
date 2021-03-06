const express=require("express")
const path=require("path")
const mongoose=require("mongoose")
const methodOverride=require("method-override")
const Campground = require("./models/Campground")
const ejsMate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError")
const console = require("console")
const campgrounds=require("./routes/campgrounds")
const reviews=require("./routes/reviews")
const session=require("express-session")
const flash=require("connect-flash")
const req = require("express/lib/request")

mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db=mongoose.connection
db.on("error",console.error.bind(console, "connection error::"))
db.once("open",()=>{
    console.log("Database Connected")
})

const app=express()
app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public")))




const sessionConfig={
    secret:"thisshouldbeabettersecret",
    resave:false,
    saveUnitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}


app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    next()
})

app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)

app.get("/",(req,res)=>{
    res.render('home')
})
 
app.all("*", (req, res, next)=>{
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} =err
    if(!err.message) {
        err.message="Oh no something went wrong"
    }
    res.status(statusCode).render("error", {err})
})

app.listen(3000, ()=>{
    console.log("Server running on port 3000")
})
