const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://olson:olson15578741@cluster0.rq3zski.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function adddata(dataset){
    client.connect(err => {
        const database = client.db("test")
        const collection = database.collection("devices");
        // perform actions on the collection object
        collection.insertOne({"name":"sally","age":33},(err,result)=>{
            if(err){
                //console.log("增加数据到数据库中失败：",err)
                return
            }
            //console.log("增加数据到数据库中成功：",result)
        })
        collection.find().toArray((err,data)=>{
            if(err){
                console.log("查询失败：",err)
                return
            }
            //console.log("查询数据成功：",data[0])
            client.close() //操作数据库完毕之后，一定要关闭数据库连接
        })
    });
}