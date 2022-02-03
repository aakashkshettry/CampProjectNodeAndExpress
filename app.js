const express=require("express")
const path=require("path")
const mongoose=require("mongoose")
const methodOverride=require("method-override")
const Campground = require("./models/Campground")
const ejsMate=require("ejs-mate")
const catchAsync=require("./utils/CatchAsync")
const ExpressError=require("./utils/ExpressError")
const console = require("console")
const {campgroundSchema, reviewSchema}=require("./schemas.js")
const Review=require("./models/review")
const CatchAsync = require("./utils/CatchAsync")

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

const validateCampground=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

const validateReview=(req, res, next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}




app.get("/",(req,res)=>{
    res.render('home')
})
 
app.get("/campgrounds", catchAsync(async (req,res)=>{
    const campgrounds= await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
}))

app.get("/campgrounds/new",(req,res)=>{
    res.render("campgrounds/new")
})

app.post("/campgrounds", validateCampground, catchAsync(async (req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError("Invalid Campground data", 400)
    const campground=new Campground(req.body.campground)
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)
}))

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async(req,res)=>{
    //res.send("you msde it..hare krssna")
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))


app.get("/campgrounds/:id",catchAsync(async(req,res)=>{
    const campground= await Campground.findById(req.params.id).populate("reviews")
    res.render("campgrounds/show", {campground})
}))

app.get("/campgrounds/:id/edit",catchAsync(async (req,res)=>{
    const campground= await Campground.findById(req.params.id)
    res.render("campgrounds/edit", {campground})
}))

app.put("/campgrounds/:id", validateCampground, catchAsync(async(req, res )=>{
    const {id}=req.params
    const campground=await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id",catchAsync(async(req, res )=>{
    const {id}=req.params
     await Campground.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req,res)=>{
    const {id, reviewId}=req.params
    await Campground.findByIdAndUpdate(id)
    await Review.findByIdAndDelete(reviewId,{$pull:{reviews:reviewId}})
    res.redirect(`/campgrounds/${id}`)
}))

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
