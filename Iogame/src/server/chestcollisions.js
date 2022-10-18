const Constants = require('../shared/constants');
const Obstacle = require('./obstacle');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://olson:olson15578741@cluster0.rq3zski.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function adddata(dataset,state){
    client.connect(err => {
        const database = client.db("test")
        const collection = database.collection("devices");
        // perform actions on the collection object
        
        
        
        set = {"username_1": dataset[0].username,"HP_1": dataset[0].hp,"score_1": dataset[0].score,"user1_state":dataset[0].cooperationState,
                  "username_2":dataset[1].username,"HP_2": dataset[1].hp,"score_2": dataset[1].score,"user2_state":dataset[1].cooperationState,
                  "state":state}
        collection.insertOne(set,(err,result)=>{
            if(err){
                console.log("增加数据到数据库中失败：",err)
                return
            }
            console.log(set)
            client.close() 
        })

    });
}
function applychestCollisions(chests, bullets,parents,obstacle) {
    const destroyedBullets = [];
    for (const bullet of bullets) {
      // Look for a player (who didn't create the bullet) to collide each bullet with.
      // As soon as we find one, break out of the loop to prevent double counting a bullet.
      var checkin = 0;
      for (let j = 0; j < chests.length; j++) {
        
        const chest = chests[j];
        if(chest.checkopen != 0 ){
          
          obstacle.forEach(ob =>{
            if(ob.id == chest.id && ob.w == 300){
              if(ob.distanceTochest(bullet,150,150) <= 150 && 100 <= ob.distanceTochest(bullet,150,150)){
                
                destroyedBullets.push(bullet);
              }
            }})
        }
        if(chest.checkinconsole(parents[bullet.parentID])){
          if(parents[bullet.parentID]){
            parents[bullet.parentID].Updatesamechest(chest.id)
            checkin = 1;
          }
        }
        if (chest.distanceTochest(bullet,50,50) <= 50 ) {
          destroyedBullets.push(bullet);

          if(chest.checkinconsole(parents[bullet.parentID])){
            chest.addplayers(bullet.parentID)
            parents[bullet.parentID].Updatesamechest(chest.id)
            if(chest.players.length == 2 || chest.state != 0){
              if(chest.players.length >= 2 ){
                  chest.players.forEach(player =>{
                    if(chest.playerbuffer.length != 2){
                      
                      chest.addplayerbuffer(parents[player])
                    }
                })
              }

              chest.updateState();
              chest.updateCheckopen();
              obstacle.push(new Obstacle(chest.id,chest.x-100,chest.y-50,300,300))
              chest.takeBulletDamage();
              if(chest.hp<=0){
                
                if(chest.playerbuffer[0].cooperationState == chest.playerbuffer[1].cooperationState){
                  if(chest.playerbuffer[0].cooperationState == 0){
                    chest.playerbuffer[0].onOpenChest(50)
                    chest.playerbuffer[1].onOpenChest(50)
                    state = "Trust"
                  }else{
                    chest.playerbuffer[0].onOpenChest(-20)
                    chest.playerbuffer[1].onOpenChest(-20)
                    state = "Both betrayed"
                  }
                }else{
                  if(chest.playerbuffer[0].cooperationState == 1){
                    chest.playerbuffer[0].onOpenChest(70)
                    chest.playerbuffer[1].onOpenChest(-50)
                    state = "user 1 betrayed"
                  }else{
                    chest.playerbuffer[0].onOpenChest(-50)
                    chest.playerbuffer[1].onOpenChest(70)
                    state = "user 2 betrayed"
                  }
                }
                adddata(chest.playerbuffer,state)
                chest.playerbuffer[0].Leavesamechest()
                chest.playerbuffer[1].Leavesamechest()
              }
            }
            
          }else{
            if(parents[bullet.parentID]){
              parents[bullet.parentID].Leavesamechest()
            }
            chest.removePlayer(bullet.parentID)
          }
        }else{
          chest.removePlayer(bullet.parentID)
        }
      }
      if(checkin == 0){
        if(parents[bullet.parentID]){
          parents[bullet.parentID].Leavesamechest()
        }
      }
    }
    return [destroyedBullets,obstacle];
  }
  module.exports = applychestCollisions;