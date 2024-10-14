model.effectPuppetArray = {};// an object containing all spawned puppets keyed to the id's

var loadedMapEffects = false

model.mapEffects = ko.observable({});

var effectsToLoad = []

ko.computed(function(){
	var currentMapEffects = model.mapEffects()
	if(loadedMapEffects == false){
		if(currentMapEffects[model.systemName()] !== undefined){//effects exist for this map
			api.csgPuppet.killAllPuppets()
			_.forEach(currentMapEffects[model.systemName()],function(effect){
				effectsToLoad.push(effect)
			})
			loadedMapEffects = true
		}
	}
})

model.spawnAllNeededEffects = function(effectArray){
	_.forEach(effectArray,function(effect){
		model.spawnCsgEffect(effect)
	})
}


model.csgUISettings = {//testing settings
	orientation:undefined,
	selectedAnim:"NONE",
	selectedUnit:"/pa/units/land/assault_bot/assault_bot.json", 
	selectedEffect:"/pa/effects/specs/ping.pfx", 
	effectBone:"bone_root",
	boneOffset:[0,0,0], 
	boneOrient:[0,0,0], 
	useUnit:false,
	useEffect:true,
	useUnitEffects:false,
	autoDelete:false,
	timedDelete:false,
	timedReset:false,
	refreshOnFileChange:false,
	useLastEffectPath:false,
	refreshOnSettingsChange:false,
	deleteResetDuration:3,
	autoDeleteAmount:10,
	snap:0,
	scale:1,
	travelSpeed:10,

}

model.createCsgPuppet = function(settingsObject,planetId,puppetLocation){
    api.csgPuppet.createCsgEffectPuppet(settingsObject,planetId,puppetLocation);
}

model.spawnCsgEffect = function(effectObject){


	var location = {
		"planet":effectObject.planet || 0,
		"pos": effectObject.pos,
		"scale":effectObject.scale,
		//   "orient":mouseLocation.orient,
		"snap": effectObject.snap
	}
	var settings = JSON.parse(JSON.stringify(model.csgUISettings));
	settings.selectedEffect = effectObject.effectPath;

	model.createCsgPuppet(settings,effectObject.planet,location)

}



model.spawnPuppetsAfterSpawn = function(){
	if((model.isSpectator() == true || model.maxEnergy() > 0) && model.timeBarState().minValidTime !== -1){
		_.delay(model.spawnAllNeededEffects,3000,effectsToLoad)
	}
	else{
		_.delay(model.spawnPuppetsAfterSpawn,100)
	}
}

function printCurrentEffect(){//easier for mass placing
	var effect = model.effectPuppetArray[1]
	var effectJson = {
		planet:effect.location.planet,
		pos:effect.location.pos,
		effectPath:effect.usedSettings.selectedEffect,
		boneOffset:effect.usedSettings.boneOffset,
		boneOrient:effect.usedSettings.boneOrient,
		scale: effect.location.scale,
		snap:effect.location.snap
	}
	console.log(JSON.stringify(effectJson))
}

//downloads example

//
function printCurrentEffectAtMetalSpots(mapObject, planet){
	var effect = model.effectPuppetArray[1]
	
	var effectJson = {
		planet:effect.location.planet,
		pos:effect.location.pos,
		effectPath:effect.usedSettings.selectedEffect,
		boneOffset:effect.usedSettings.boneOffset,
		boneOrient:effect.usedSettings.boneOrient,
		scale: effect.location.scale,
		snap:effect.location.snap
	}

	_.forEach(mapObject.planets[planet]["metal_spots"], function(metalPos){
		var newEffectJson = JSON.parse(JSON.stringify(effectJson))
		newEffectJson["pos"] = metalPos
		console.log(JSON.stringify(newEffectJson))
	})
}

function printCurrentEffectAtCsg(spec){

}

model.spawnPuppetsAfterSpawn()