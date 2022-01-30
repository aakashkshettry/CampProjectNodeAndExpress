const path=require("path")
const cities=require("./cities")
const mongoose=require("mongoose")
const Campground = require("../models/Campground")
const {places,descriptors}=require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db=mongoose.connection
db.on("error",console.error.bind(console, "connection error::"))
db.once("open",()=>{
    console.log("Database Connected")
})

const sample=(array)=>array[Math.floor(Math.random()*array.length)]


const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*30)+10
        const camp=new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)} `,
            image:"https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg",
            description:"Lorem ipsum dolor sit, amet consectetur adipisicing elit",
            price:price
        });
    await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});