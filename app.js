let output = document.getElementById("output")
let hub = document.getElementById("hub")
let entity_dispaly = document.getElementById("entitys")

let entitys = [];
let teams = []
let alive = {teams: [], solo_entitys: []}
let order = [];
let player
let solo_entitys_html

class Team{
	#members
	constructor(name, style={section: {background_color: "none"}, members: {background_color: "green"}}){
		if(teams.map(team => team.name).includes(name)){
			let original_name = name
			for(let i = 0; teams.map(team => team.name).includes(name); i++){
				name = `${original_name}${i}`
		}}	
		this.name = name
		this.style = style
		this.leader = void 0
		this.#members = []
		this.html = `
			<div class="team" id="${this.name}" style="${styleConstructor(this.style.section)}">

			</div>
		`
		teams.push(this)
	}
	htmlUpdater(live = true){
		this.html =`
			<div class="team" id="${this.name}" style="${styleConstructor(this.style.section)}">
				${this.#members.map(entity => entity.data.html).join("")}
			</div>
			`
		if(live){
			let html = document.getElementById(this.name)
			if(!html) return
			html.innerHTML = this.html
		}
	}
	addMember(new_member, is_leader=false){
		if(!entitys.includes(new_member)) {
			console.warn(`expected a entity, got ${new_member}`);
			console.log(new_member);
			return
			
	}
		this.#members.push(new_member)
		new_member.data.team = this
		new_member.data.teamStyle = this.style.members
		new_member.hasTeam = true
		if(is_leader) this.leader = new_member
		this.htmlUpdater()
	}
	hasMembers(){
		return this.#members.filter(entity => entity.hp > 1).length > 0
	}
}

class Entity{
	constructor(name, hp=20, atk=5, def=0, speed=1, is_player=false, data = {html: void 0, style: {display: "flex"},team: void 0}){
		this.name = name
		this.hp = hp
		this.atk = atk
		this.def = def
		this.speed = speed
		this.defending = false
		this.isPlayer = is_player
		this.hasTeam = false
		this.data = data
		this.id ="entity"+entitys.length
		if(!this.data.actionList || this.data.actionList === 0) this.data.actionList = ["hit", "defend"]
		entitys.push(this)
		//display setup
		this.htmlUpdater()
		if(this.data.team){
			if(this.data.team instanceof String) this.data.team = new Team(this.data.team,{members: this.data.style})
			this.teamStyle = {}
			this.data.team.addMember(this)
		}
	}
	//npc
	npcChois(){
		console.log(`${this.name} is taking a action`);
		
		if(this.isPlayer) return false
		if(Math.random() < 0.5){
			let targets = entitys_alive.filter(entity => entity!==this)
			let target = targets[Math.floor(Math.random() * targets.length)]
			this.hit(target)
		}
		else this.defend()
		return true
		}
	//player
	action(chois){
		if(!this.isPlayer) return false
		if(chois === "hit"){
			let target_id = document.getElementsByClassName("targeted")[0].id
			console.log(`target: ${entitys.find(entity => entity.id === target_id).name}`);

			let target = entitys.find(entity => entity.id === target_id)

			if (target !==this && target.data.team != this.data.team){
				this.hit(target)
				playerTurnEnd()
				return true
			}
			else{
				console.warn(`${target} is a invalid target`);
				return
			}
		}
		else if (chois === "defend") {
			this.defend()
			playerTurnEnd()
			return true
		}
		else if(chois === "pass"){
			playerTurnEnd()
			return true
		}
		else console.warn(`${chois} is a invalid action!`);
		

	}
	//actions
	hit(other){
		let damage = 0
		if(this.defending){
			this.defending = false
		}
		if(other.hp > 0 && other != this && other.data.team != this.data.team){
		if(other.defending){damage = this.atk / (other.def / 3)}
		else{damage = this.atk / (other.def / 10)}
		addOutput(`${this.name} deld ${damage.toFixed(2)} damage to ${other.name}!`)
		other.hp -= damage
		other.hpUpdate()
		if(other.hp < 1){
			other.defeat()
		}
		}
		else{
			if(other === this){
				addOutput(`${this.name} tride to hit themselfs.`)
			}
			else{
			addOutput(`${other.name} is already dead`)
		}
		}
	}
	defend(){
		addOutput(`${this.name} is defending themself.`)
		this.defending = true
	}
	htmlUpdater(){
		let html = document.getElementById(this.id)
		if(!this.data.style) this.data.style = {}
		let chosen_style = this.data.style
		if(!this.data.style.background_color){
			chosen_style.background_color = "black"
		}
		if(!this.data.style.color){
			chosen_style.color = "white"
		}
		if(!this.data.image){
			this.data.image = "img/defalt_char.jpg"
		}
		if(html){
		this.data.html =(
		`
			<img src="${this.data.image}">
			<h2>${this.name}</h2>
			<h3 id="${this.id}HP">HP: ${this.hp}</h3>
		`
		)}
		else{
			this.data.html =`
				<div id="${this.id}" class="entity" style="${styleConstructor(this.data.style)}" onclick="target('${this.id}')">
					<img src="${this.data.image}">
					<h2>${this.name}</h2>
					<h3 id="${this.id}HP">HP: ${this.hp}</h3>
				</div>
			`
		}
	}
	hpUpdate(){
		let hpElement = document.getElementById(this.id + "HP")
		if(hpElement){
			hpElement.innerText = `HP: ${this.hp.toFixed(2)}`
		}
	}
	defeat(){
		entitys_alive = entitys_alive.filter(entity => entity !== this)
		addOutput(`${this.name} can no longer ficht!`)
		document.getElementById(this.id).style.display = "none"

	}
}
function nonTeam(solo_entitys){//this is a seperat aria for entitys that are not a member of a team
	let div = document.getElementById("team#null")
	let html = ""
	for (let entity of solo_entitys){
		html += entity.data.html
	}
	solo_entitys_html = `
	<div class="team" id="team#null">
		${html}
	</div>
	`
	}
let adventures = new Team("golden eis", {backgroundColor: "orrange"})
let monsters = new Team("wild", {section: {backgroundColor: "red"}})
let user = new Entity("user", 50, 8, 5, 2, true, {style: {color: "white", background_color: "blue"}, team: adventures})
let npc1 = new Entity("dog", 35, 5, 4, 3, true, {team: adventures, style: {color: "yellow"}})
let npc2 = new Entity("ogre", 80, 15, 7.5, 1, false, {team: monsters})

function styleConstructor(styles = {color: "white"}){
	let style_string = ""
	for(let key in styles){
		let styleProperty = key.replace("_","-")
		style_string += `${styleProperty}: ${styles[key]};`
	}
	return style_string
}
function styleAdder(entity_style, team_style){
	let keys = []
	for(let key in team_style)if(!entity_style.includes(key)) keys.push(key)
	//let new_style_list = 

}

function turn(){
	let log_start = "---------------turn start---------------"
	let log_end = "---------------turn end---------------"
	console.log(log_start);
	let alive = {solo_entitys: entitys.filter(entity => entity.hp && !entity.hasTeam), teams: teams.filter(team => team.hasMembers())}
	if((alive.teams.length + alive.solo_entitys.length) === 1){
		let winner
		if (alive.solo_entitys[0]) winner = alive.solo_entitys[0]
		else winner = alive.teams[0]
		return (addOutput(`${winer.name} has won the ficht!`) && console.log(log_end + 1));
	}
	
	const MAX_SPEED = Math.max(...entitys_alive.map(entity => entity.speed));
	//defining order
	console.log(MAX_SPEED)
	console.log("defining order");
	
	for(let i = 0; i <= MAX_SPEED*2; i++){
		console.log(`loop ${i}`);
		
		for(let entity of entitys_alive){
			
			if(entity.speed > i/2) order.push(entity)
		}
	console.log(order.map(entity => entity.name));
	
	}
	if(order.length < 1){
		console.warn("no entity is in play");
		return console.log(log_end + 2);
		
	}
	return console.log(log_end + 3);

	
}
function npc_phase(){ //depricated
	console.log("-----------npc-phase-------------");
	return
	
	if(order.length < 1) return turn()
	while(order.length > 0 && !order[0].isPlayer && entitys_alive.length > 1){
		console.log(order[0]);
		entitys_alive = entitys.filter(entity => entity.hp > 0)
		if(order[0].hp > 0){
			console.log(order);
			
			let npc = order.shift()
			console.log(npc);
			
			npc.npcChois()
		}
		else order.shift()
	}
	if(entitys_alive.length === 1)return addOutput(`${entitys_alive[0].name} has won the ficht!`)
	if(order.length < 1) return turn()
	if(order[0].isPlayer === true){//this wil only run if it is the players turn.
		playerTurnStart()
	}
}
function addOutput(text){
	let output_text = output.innerText.split("\n")
	output_text.push(text)
	if(output_text.length > 3){
		output_text.shift()
	}
	output.innerText = output_text.join("\n")
}
function target(id){
	console.log("---------------target---------------");
	
	if(!player) return
	if(document.getElementsByClassName("targeted")[0]){
		let old_target = document.getElementsByClassName("targeted")[0]
		old_target.classList.remove('targeted')
		old_target.style.borderColor = "black"
		old_target.style.borderWidth = "5px"
	}
	let target_html = document.getElementById(id)
	let target = entitys.find(entity => entity.id === id)
	target_html.classList.add("targeted")
	
	if(player.data.team === target.data.team || target === player){
		
		target_html.style.borderColor = "green"
		target_html.style.borderWidth = "10px"
		console.log(target.name);
		
	}
	else {
		target_html.style.borderColor = "red"
		target_html.style.borderWidth = "10px"
	}
}
function start(){
	console.log("----------------start---------------");
	
	entitys_alive = entitys.filter(entity => entity.hp > 1)
	hub.innerHTML =`
	<input type="button" value="next" onclick="next()">	`
	next()
}
function playerTurnStart(){
	console.log("-----------playerTurnStart------------");
	let html = ""
	for(action of player.data.actionList){
		html +=`
		<input type="button" value="${action}" onclick="player.action('${action}')">
		`
	}
	hub.innerHTML = html
	if(player.hp < 1) return playerTurnEnd()
	addOutput(`its ${player.name}'s turn!`)
	hub.style.backgroundColor = player.data.style.background_color || "black";
	hub.style.borderColor = "black"
	hub.style.borderWidth = "5px"
	enebelHub(true)
}
function playerTurnEnd(){
	player = void 0
	hub.style.backgroundColor = ""
	hub.style.borderColor = ""
	let target = document.getElementsByClassName("targeted")[0]
	target.style.borderColor = "black"
	target.style.borderWidth = "2.5px"
	enebelHub()
}
function next(){
	hub.style.display = "none"
	console.log("------------next-----------");
	if(entitys_alive === 1)addOutput(`${entitys_alive[0].name} is the last one standing!`)
	if(order.length === 0 || !order){turn(); console.log("---------------reëntering next---------------");
	}
	if(entitys_alive.length > 1){console.log("---------------entitys_alive---------------");
	
	let curent = order.shift()
	console.log(`turn for ${curent.isPlayer ? "PC" : "NPC"}: ${curent.name}`);
	if(curent.hp < 1) return next()
	if (!curent.isPlayer) {
		curent.npcChois()
		enebelHub()
	}
	else if(curent.hp > 1){
		player = curent
		console.log(player);
		playerTurnStart()
	}}
	else return
}
function enebelHub(player_turn = false){
	if(!player_turn){
		hub.innerHTML =`
		<input type="button" value="next" onclick="next()">	`
		hub.style.backgroundColor = "none"
	}
	hub.style.display = "flex"

}
let entity_dispaly_html = ""
for(let team of teams){
	entity_dispaly_html += team.html
}
console.log(entity_dispaly_html);

entity_dispaly.innerHTML = entity_dispaly_html
//thest code
//document.getElementById(npc1.id).className = "targeted"
//user.action("hit")
