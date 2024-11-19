let battleLog = document.getElementById("log")
let hub = document.getElementById("hub")
let overworld = document.getElementById("overworld")
let entity_dispaly = document.getElementById("entitys")

let player_name = "player"
let entitys = []
let teams = []
//let entitys_alive = []
let alive = {teams: new Set(), solo_entitys: new Set()}
let order = [];
let player
let solo_entitys_html
let is_batle = false
let function_bept = ["main"] //used to show how deep a function is
const debug = true
class Team{
	#members
	#nonTeam = false
	constructor(name = "team", style={section: {background_color: ""}, members: {background_color: ""}}, nonTeamFlag = false){
		function_bept.push(`Team--constructor--${name}`)
		if(teams.map(team => team.name).includes(name)){
			let original_name = name
			for(let i = 0; teams.map(team => team.name).includes(name); i++){
				name = `${original_name}${i}`
		}}	
		this.name = name
		this.style = style
		this.leader = void 0
		this.#members = []
		this.#nonTeam = nonTeamFlag
		this.html = `
			<div class="team" id="${this.name}" style="${styleConstructor(this.style.section)}">

			</div>
		`
		if(!this.#nonTeam)teams.push(this)
		function_bept.pop()
	}
	htmlUpdater(live = true){
		function_bept.push(`Team(${this.name})--htmlUpdater`)
		if (debug) {
		console.log(`---------------${this.name}: htmlUpdater---------------`)
		}
		this.html =`
			<div class="team" id="${this.name}" style="${styleConstructor(this.style.section)}">
				${this.#members.map(entity => entity.data.html).join("")}
			</div>
			`
		if(live){
			let html = document.getElementById(this.name)
			if(!html) {
				debug ? console.log("no html in DOM\n", function_bept): void 0;
				function_bept.pop()
				return
			}
			
			html.innerHTML = this.html
		}
		if (debug) {
		console.log("---------------number of lines---------------")
		console.log(`number: ${this.html.split("\n").length}`)
		console.log(function_bept);
		}
		function_bept.pop()
	}
	addMember(new_member, is_leader=false){
		function_bept.push(`team(${this.name})--addMember`)
		if (debug) {
		console.log("---------------addMember---------------")
		console.log(`
			entity name: ${new_member.name}
			entity hp: ${new_member.hp}
			other members: ${this.#members.map(e => e.name)}
			`)
		}
		if(this.#members.includes(new_member)) return function_bept.pop()
		if(!entitys.includes(new_member)) {
			console.warn(`expected a entity`);
			console.log(new_member);
			console.log(function_bept);
			function_bept.pop
			return
			}
		if(new_member.hasTeam){
			new_member.data.team.removeMember(new_member)
		}
		this.#members.push(new_member)
		new_member.data.team = this
		new_member.data.teamStyle = this.style.members
		new_member.hasTeam = true
		if(is_leader) this.leader = new_member
		this.htmlUpdater()
		function_bept.pop
	}
	removeMember(member){
		function_bept.push(`Team(${this.name})--removeMember`)
		if(!this.#members.includes(member)) return
		if(this.leader === member) this.leader = void 0
		this.#members -= member
		member.hasTeam = false
	}
	membersAlive(){
		
		function_bept.push(`Team(${this.name})--membersAlive`)
		if(this.#nonTeam){
			console.log(`---------------noTeam---------------`);
			
			function_bept.pop()
			return 0
		}
		if(debug) {
		console.log(`
			---------------${this.name} membersAlive---------------
			number: ${this.#members.filter(entity => !entity.isDead()).length}
			`)
		}
		function_bept.pop()
		return this.#members.filter(entity => !entity.isDead()).length
	}
	hasMembers(){return this.membersAlive() != 0}
	isMember(other){
		if(this.#nonTeam) return false
		return this.#members.includes(other)
	}
	nonTeam(){
		return this.#nonTeam
	}
}
class Entity{
	#isDead
	constructor(name, hp=20, atk=5, def=5, speed=1, is_player=false, data = {html: void 0, style: {display: "flex"},team: void 0}){
		function_bept.push(`entity--constructor--${name}`)
		this.name = name
		this.hp = hp
		this.atk = atk
		this.def = def
		this.speed = speed
		this.defending = false
		this.isPlayer = is_player
		this.hasTeam = false
		this.#isDead = false
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
		function_bept.pop()
	}
	npcChois(){//npc
		function_bept.push(`entity(${this.name})--npcChois`)
		console.log(`${this.name} is taking a action`);
		
		if(this.isPlayer || this.#isDead) {
			function_bept.pop()
			return false
		}
		const chois = this.data.actionList[Math.floor(Math.random() * this.data.actionList.length)]
		if(chois === "hit"){
			console.log(entitys_alive);
			
			let targets = entitys_alive.filter(entity => entity!==this && !this.#isAlie(entity))
			let target = targets[Math.floor(Math.random() * targets.length)]
			this.hit(target)
		}
		else if(chois === "defend"){
			this.defend()
		}
		else{
			addOutput(`${this.name} has skitp there turn...`)
		}
		}
	action(chois){//player
		if(!this.isPlayer || this.#isDead) return false
		let target_id = this.id
		let target = document.getElementsByClassName("targeted")[0]
		if(target) target_id = target.id
		if(chois === "hit"){
			console.log(`target: ${entitys.find(entity => entity.id === target_id).name}`);
			let target = entitys.find(entity => entity.id === target_id)

			if (target != this && !this.#isAlie(target) && !target.isDead()){
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
		else if(chois == "check"){
			let target = entitys.find(entity => entity.id === target_id)
			addOutput(target.description())
		}
		else console.warn(`${chois} is a invalid action!`);
		

	}
	//actions
	hit(other){
		let damage = 0
		if(this.defending)this.defending = false;
		if(!other.isDead() && other != this && !this.#isAlie(other)){
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
			else if(this.#isAlie(other))
				addOutput(`${this.name} tried to hourt its own alie`)
			else if(other.hp < 0){
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
		this.#isDead = true
		addOutput(`${this.name} can no longer ficht!`)
		document.getElementById(this.id).style.display = "none"

	}
	isDead(){
		return this.#isDead
	}
	#isAlie(other){
		return this.data.team.isMember(other)
	}
	description(){
		return `type: entity, name: ${this.name}, hp: ${this.hp}, ATK: ${this.atk}, DEF: ${this.def}`
	}
}
function nonTeam(){//this is a seperat aria for entitys that are not a member of a team
let solo_entitys = entitys.filter(e => !e.hasTeam)
if (debug) {
console.log("---------------nonTeam---------------")
console.log(`entitys withoud a team: ${solo_entitys.map(e => e.name)}`)
}
solo_entitys.forEach(entity => {
	noTeam.addMember(entity)
});
}
//teams and entitys===============================================================================//
let adventures = new Team("golden eis", {section: {background_color: "orange"}})
//let monsters = new Team("wild", {section: {backgroundColor: "red"}})
const noTeam = new Team("solo", {}, true)
//=================================================================================================//
let user = new Entity(player_name, 1, 8, 5, 2, true, {style: {color: "white", background_color: "blue"}, team: adventures, actionList: ["hit", "defend", "check"]})
//let npc1 = new Entity("dog", 35, 5, 4, 3, false, {team: adventures, actionList: ["hit", "hit", "defend"]})
//let npc2 = new Entity("ogre", debug ? 10 : 60, 15, 7.5, 1, false, {team: monsters})
//let npc3 = new Entity("goblin", debug ? 200 : 30, 5, debug ? 4 : 5, 2, false, {actionList: ["hit"]})
let npc4 = new Entity("???", Math.floor(Math.max(50, Math.random() * 100, Math.random() * 200, Math.random() * 250)), Math.max(10,Math.random() * 15), Math.max(Math.random() * 15, Math.random() * 10), Math.random() *5, )
//=================================================================================================//
checkInPlay()
nonTeam()
if (debug) {
console.log("---------------entity & team check---------------")
console.log(`
	entitys: ${entitys.map(e => e.name)}
	teams: ${teams.map(t => t.name)}
	`)
}
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
	
	const MAX_SPEED = Math.max(...entitys_alive.map(entity => entity.speed));
	//defining order
	console.log(MAX_SPEED)
	console.log("defining order");
	
	for(let i = 0; i <= MAX_SPEED*2; i++){
		console.log(`loop ${i}`);
		
		for(let entity of entitys_alive){
			if(entity.hp < 1) continue
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
function addOutput(text){
	let output_text = battleLog.innerText.split("\n")
	output_text.push(text)
	if(output_text.length > 3){
		output_text.shift()
	}
	battleLog.innerText = output_text.join("\n")
}
function target(id){
	if(debug)console.log("---------------target---------------");
	
	if(!player) return
	if(document.getElementsByClassName("targeted")[0]){
		let old_target = document.getElementsByClassName("targeted")[0]
		old_target.classList.remove('targeted', "targeted_enimy", "targeted_aliy")
	}
	let target_html = document.getElementById(id)
	let target = entitys.find(entity => entity.id === id)
	target_html.classList.add("targeted")
	
	if(player.data.team.isMember(target) || target === player){
		
		target_html.classList.add("targeted", "targeted_aliy")
		console.log(target.name);
		
	}
	else {
		target_html.classList.add(["targeted", "targeted_enimy"])
	}
}
function start(){
	if(debug)console.log("----------------start---------------")
	
	entitys_alive = entitys.filter(entity => entity.isDead)
	hub.innerHTML =`
	<input type="button" value="next" onclick="next()">	`
	is_batle = true
	next()
}
function playerTurnStart(){
	if(debug)console.log("-----------playerTurnStart------------");
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
	if (debug) {
	console.log("---------------playerTurnEnd---------------")
	}
	hub.style.display = "none"
	player = void 0
	hub.style.backgroundColor = ""
	hub.style.borderColor = ""
	let target = document.getElementsByClassName("targeted")[0]
	if(target){
	target.style.borderColor = "black"
	target.style.borderWidth = "2.5px"
	}
	enebelHub()
}
function next(){
	if (debug) {
	console.log("---------------next---------------")
	}
	hub.style.display = "none"
	if(!checkInPlay()) return
	if(order.length === 0 || !order){turn(); console.log("---------------reëntering next---------------");
	}
	
	let curent = order.shift()
	console.log(`turn for ${curent.isPlayer ? "PC" : "NPC"}: ${curent.name}`);
	if(curent.hp < 1) return next()
	if (!curent.isPlayer) {
		curent.npcChois()
		enebelHub()
	}
	else if(curent.isPlayer){
		player = curent
		console.log(player);
		playerTurnStart()
	}
	else{return}
}
function enebelHub(player_turn = false){
	if (debug) {
	console.log("---------------enebelHub---------------")
	}
	if(!player_turn){
		hub.innerHTML =`
		<input type="button" value="next" onclick="next()">	`
		hub.style.backgroundColor = "none"
	}
	hub.style.display = "flex"

}
function checkInPlay(){
	if (debug) {
	console.log("---------------checkInPlay---------------")
	}
	let teams_in_play = teams.filter(team => team.hasMembers())
	let solo_entitys = entitys.filter(entity => noTeam.isMember(entity) && entity.hp > 0)
	if (debug) {
	console.log(`
		---------------alive---------------
		teams: ${teams_in_play.length}
		solo enitys: ${solo_entitys.length}
		`)

	}
	alive = {teams: teams_in_play, solo_entitys: solo_entitys}
	const num_alive = teams_in_play.length + solo_entitys.length
	if(num_alive === 1 && is_batle){
		if(teams_in_play[0].hasMembers() && !teams_in_play[0].nonTeam()){
			addOutput(`team "${teams_in_play[0].name}" has won the ficht!`)
		}
		else{addOutput(`${solo_entitys[0].name} has won the ficht!`)}
		is_batle = false
		return false;
	}
	else return true;
}
function debugSetup(){
	enebelHub(true)
	hub.innerHTML = `
	<input type="button" value="fors display" onclick="forsDisplay()">
	`
}
let entity_dispaly_html = ""
if (debug) {
console.log("---------------setup html entitys---------------")
console.log(teams);

}
for(let team of teams){
	if (debug) {
	console.log(`"---------------${team.name}:html loop---------------"`)
	}
	entity_dispaly_html += team.html
}
console.log(entity_dispaly_html);

entity_dispaly.innerHTML = entity_dispaly_html
if (debug) {
    console.log("---------------final setup stats---------------");
    console.log('Entities:', JSON.stringify(entitys, null, 2));
    console.log('Teams:', JSON.stringify(teams, null, 2));
    console.log('Alive:', JSON.stringify(alive, null, 2));
}
