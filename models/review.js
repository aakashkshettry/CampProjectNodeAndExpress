const { number } = require("joi")
const mongoose=require("mongoose")
const Schema=mongoose.Schema

const reviewSchema=new Schema({
    body:String,
    rating:number
})

exports = mongoose.model("Review", reviewSchema)