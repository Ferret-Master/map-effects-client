
var moveDuration = 0.2;
var usingEffectMovePath = false;
function init_puppet_control(api) {
    api.csgPuppet = {

    createCsgEffectPuppet: function(settingsObject,planetId,puppetLocation){//the single puppet creating function that takes all settings into account
      if(settingsObject == undefined){settingsObject = model.csgUISettings}
      //checks for error in effect file(important for refreshes)
      var effectError = false;
      $.getJSON("coui://"+settingsObject.selectedEffect, function(json) {
        try{
        var temp = JSON.parse(JSON.stringify(json))
        }
        catch(error){
            effectError = true;
        }
    }).error(function(error){effectError = true;}).then(function(result){

      var puppetConfig = {};

     
        
          var location = {
              "planet":planetId || 0,
              "pos": puppetLocation,
              "scale":settingsObject.scale,
           //   "orient":mouseLocation.orient,
              "snap": settingsObject.snap
          }

          if(settingsObject.orientation !== undefined){
            location.orient = settingsObject.orientation;
          }

          //if it is a reset/refresh use previous location

       
          if(puppetLocation !== undefined){
              location = puppetLocation;
          } 

          //puppet location added  
          puppetConfig.location = location;


          
          //called regardless of unit being used to simplify function logic
          $.getJSON("coui://"+settingsObject.selectedUnit, function(json){

                //if useUnit is enabled
                puppetConfig.fx_offsets = [];
                if(settingsObject.useUnit == true){
                  var unitModel = json.model;
                
                  if(Array.isArray(unitModel)){
                      unitModel =unitModel[0]
                  }
                  //puppet model added
                  puppetConfig.model = unitModel;
                  if(settingsObject.selectedAnim !== "NONE"){
                    //puppet anim added
                    puppetConfig.animate = {"anim_name":settingsObject.selectedAnim}
                  }
                  if(settingsObject.useUnitEffects == true){
                    //existing unit effects added
                    puppetConfig.fx_offsets = json.fx_offsets;
                    if(puppetConfig.fx_offsets == undefined){puppetConfig.fx_offsets = []}
                  }

                }
                if(settingsObject.useEffect == true && effectError == false){
                  //selected effect added
                  puppetConfig.fx_offsets.push({
                    "type":"energy",
                    "filename":settingsObject.selectedEffect,
                    "bone":settingsObject.effectBone,
                    "offset":settingsObject.boneOffset,
                    "orientation":settingsObject.boneOrient
                  })
                }
                //if neither option remove the field
                if(puppetConfig.fx_offsets.length == 0){puppetConfig.fx_offsets = undefined}

                //add the material, may make this customizable in future
                puppetConfig.material = {
                    "shader":"pa_unit",
                    "constants":{
                    "Color":[100,100,100,5],
                    "BuildInfo":[0,0,0]
                    },
                    "textures":{
                    "Diffuse":"/pa/effects/diffuse.papa"
                    }
                    }  

                    //base game puppet api called, returns the puppets id which we need to interact with it
     
                      api.getWorldView(0).puppet(puppetConfig, true).then((function(result){
  
                        var puppetObject = {}
                        puppetObject.id = result.id;
                        puppetObject.location = location;
                        puppetObject.usedSettings = settingsObject
                        $.getJSON("coui://"+settingsObject.selectedEffect).then(function(data){
                              puppetObject.string = JSON.stringify(data)
                        model.effectPuppetArray[result.id] = puppetObject;
                        
                      })
                  }));
          })   
      
     

    })
    },

 
    killPuppet:function (puppetid){
   
    api.getWorldView(0).unPuppet(puppetid);
    },
     
    killAllPuppets:function(){
        
        
        if(model.maxEnergy() > 0 || model.isSpectator() == true){
            
            api.getWorldView(0).clearPuppets();
            return;
        }
        else{setTimeout(killAllPuppets, 1000);
        return;}
        
        
        }
    
    };
    }
    init_puppet_control(window.api);


    //Hotkey functions
    var cursor_x = -1;
    var cursor_y = -1;
    document.onmousemove = function(event)
    {
    
    cursor_x = event.pageX;
    cursor_y = event.pageY;
    }


    