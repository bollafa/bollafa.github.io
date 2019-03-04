// maquina sencilla : author: @justanotherhuman
'use strict'
let symbols = new Map();
function compile() {
	let lines = document.querySelector("#code").value.trim()
		.split('\n');
	/*let cpu = {
		pc: 0,
		zf: false,
		bp: false, // breakpoint
	};*/

	//let ram = new Array(500);
	return function(cpu,ram) {
		symbols = new Map();

		let keywords = {
			mov: function ( left,right ) {
				ram[right] = ram[left];
			},
			add: function ( left,right ) {
				ram[right] += ram[left];
				ram[right] %= 0xFFFF+1;
			},
			cmp: function(left,right){
				cpu.zf = (ram[left] === ram[right]);
			},
			beq: function(addr){
				if(cpu.zf) {
					cpu.pc = addr;
				}
			},
			hlt: function() {
				cpu.bp = true;
			}
		};
		let directives = {
			dato: function(value){
				if(typeof(value) === "string")
					return parseInt(value,16);
				return value;
			},
		};

		let tokens = tokenize_lines(lines,keywords,directives);
		let first_changes = first_pass(tokens,symbols,directives);
		let second_changes = second_pass(tokens,symbols,keywords);

		first_changes(ram);
		second_changes(ram);
	}
}

function tokenize(line,keywords,directives) {
	directives = directives || {};
	let regexpr = /[ ,:]+/;
	let tokens = line.split(regexpr);

	let label = keywords[tokens[0]] ||
		directives[tokens[0]] ? '' : tokens[0];

	if (label) {
		tokens = tokens.slice(1);
	}

	let token_line = {
		symbol: label,
		instruction: { 
			directive: Boolean(
				directives[tokens[0]]),
			operator: tokens[0],
			params: tokens.slice(1),
		}
	};
	return token_line;
}


function tokenize_lines(lines,keywords,directives) {
	let token_lines = [];

	lines.forEach(function(elem) {
		let token_line = tokenize(elem.trim(),
			keywords,directives);
		if(elem.trim()) {
			token_lines.push(token_line);
		}
	});
	return token_lines;
}

function first_pass(tokens,symbols,directives) {
	let changes = [];
	tokens.forEach(function(value,i) {
		if(!symbols.has(value.symbol)) {
			symbols.set(value.symbol,i);
		}
		if(value.instruction.directive){
			//console.log(directives);
			if(directives[value.instruction.operator].length
				!= value.instruction.params.length) {
				throw new Error(i+": "+value.instruction.
					operator
					+" "
					+value.instruction.params
					+
					" Incorrect number of parameters!");
			}

			changes.push(function(ram) {
				//console.log(directives);
				ram[i] = directives[value
				.instruction
				.operator](...value.instruction.params);
			});
		}

	});

	return function(ram) {
		changes.forEach(function(value) {
			value(ram);
		});
	}
}
function parse_params(params,symbols) {
	let result = new Array(params.length);
	params.forEach(function(value,i) {
		if(!symbols.has(value)) {
			throw new Error("unknown label `" + value + "`");
		}
		result[i] = symbols.get(value);
	});
	return result;
}
function second_pass(tokens,symbols,keywords) {
	let changes = [];
	tokens.forEach(function(token,i) {
		if(!token.instruction.directive &&
			keywords[token
			.instruction
			.operator] == undefined) {
				throw new Error("`"+token.instruction.
					operator
					+"` unknown mnemonic! at line ("
					+i+")");
		}

		let params = token.instruction.directive ? 
			0 : parse_params(token.instruction.params,symbols);

		if(!token.instruction.directive &&
			keywords[token
				.instruction
				.operator].length !== token
			.instruction.params.length) {
			throw new Error("incorrect number of parameters at line ("
				+i+")");
		}

		if(!token.instruction.directive) {
			changes.push(function(ram) {
				ram[i] = function() { 
						keywords[token
						.instruction
						.operator](...params);
				};
			});
		}
	});
		return function(ram) {
			changes.forEach(function(change) {
				change(ram);
			});
		};






}

var ram = new Array(500);
var cpu = {
	pc: 0,
	zf: false,
	bp: false,
};
function compile_run() {
	let pre = compile();
	ram = new Array(document.querySelector("#code").value
		.trim().split("\n").length);
	cpu.pc = 0;
	cpu.zf = false;
	cpu.bp = false;
	try {
		pre(cpu,ram);
	}catch(error) {
		document.querySelector("#compile_error").textContent = "Compile "+
			error;
		return;
	}


	tick();

	document.querySelector("#compile_error").textContent = '';


}

function tick(){
	let old_pc = cpu.pc;
		ram[cpu.pc]();

		if(old_pc === cpu.pc) {
			cpu.pc++;
		}
		print_symbols();
	if(!cpu.bp) {
		setTimeout(tick,10);
	}
}

function print_symbols() {
	let out = document.querySelector("#symbols");

	out.innerHTML = '';

	symbols.forEach(function(value,key) {
		if(key) {
			if(typeof(ram[value]) === "number") {
				out.innerHTML+= escapeHTML(key) + " = " + 
					(ram[value]) 
				+ "<br />";
			}
		}
	});


}



function escapeHTML(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


function stop() {
	cpu.bp = true;
}
