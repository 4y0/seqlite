//property map: t = type, pk = primaryKey, ai = autoIncrement, un = unique, an = allowNull, dv = defaultValue
/* 
def maps: 
PKD == primary key default ===> t:integer, pk:true ai:true
S == string default ==> t:string
I == integer default ==> t:integer
SU == string unique default ==> t:string, u:true
IU == integer unique default ==> t:integer, u:true
SUA
IUA
D
DUA
*/

/*
type.number translates to TYPE(NUMBER)
*/

//define maps
var property_map = {
	t:'type',
	pk:'primaryKey',
	ai:'autoIncrement',
	un:'unique',
	an:'allowNull',
	dv:'defaultValue'
};

//todo add more types
var quick_key_map = {
	PKD:'t:integer, pk:true, ai:true',
	S:'t:string',
	D:'t:double',
	I:'t:integer',
	U:'un:true',
	A:'an:true',
	T:'t:date'
}

function resolve_property(pstring){

	var _ps = pstring.replace(/\s/g, ''); //Remove all spaces.
	var _ps_tokens = _ps.split(',');
	var resolved_property = {};
	_ps_tokens
	.forEach( function (token) {

		if(!token) throw new Error('Error parsing property token');

		var token_parts = token.split(':');
		if(!token_parts[0] || !token_parts[1]) throw new Error('Token part invalid. expected [propkey]:[proptype]');

		var prop_key = token_parts[0].toLowerCase();
		var prop_typ = token_parts[1];

		var resolve_key = prop_key;
		if(property_map[prop_key]) resolve_key = property_map[prop_key];

		var prop_suffix = "";
		if(prop_key == 't'){
			prop_typ = prop_typ.toUpperCase(); // t:integer should return type:DataTypes.INTEGER .. u:true should be unique:true
			prop_suffix = "DataTypes.";	
		} 

		resolved_property[resolve_key] = prop_suffix + prop_typ;

	});

	return resolved_property;

}

function resolve_shortform(sstring){

	var _ss = sstring.toUpperCase().trim();

	if(_ss == "PKD") return resolve_property(quick_key_map[_ss]);

	var _ss_tokens = _ss.split('');
	var resolved_tokens = [];

	_ss_tokens
	.forEach( function (token) {

		if(!quick_key_map[token]) throw new Error('Cannot resolve shortform. Token not in quick_key_map ' + token);


		resolved_tokens.push(quick_key_map[token]);

	});

	return resolve_property(resolved_tokens.join(','));
}

function process_definition(def){

	if(def.split(',').length === 1)
		return resolve_shortform(def);
	else
		return resolve_property(def);

}

function parse(def_string){

	var attrib = {};
	var def_string_tokens = def_string.split(',');
	var seq_attrib_name = def_string_tokens[0].trim();
	attrib[seq_attrib_name] = process_definition(def_string_tokens.slice(1).join(','));
	return {attrib_name:seq_attrib_name, attrib_props:attrib[seq_attrib_name]};

}



function process_shit(schema_def){

	var schema = {};
	var schema_def_tokens = schema_def.split('\n');
	var schema_name = schema_def_tokens[0];
	var schema_attrib_defs = schema_def_tokens.slice(1);

	schema_attrib_defs
	.forEach( function (sad) {

		var parsed = (parse(sad));
		schema[parsed.attrib_name] = parsed.attrib_props;

	});

	return {
		schema_name:schema_name,
		schema_attrib_def:schema,
		schema_attrib_def_normalized:JSON.stringify(schema, null, '\t').replace(/("DataTypes\.([a-zA-Z0-9]+)?")/g, "DataTypes.$2")
	}

}



function init(){

	//console.log(__dirname, process.argv);
	var seqlite_file = process.argv[2] || "test.txt";
	var fs = require('fs'), path = require('path');
	var schema_def = fs.readFileSync(seqlite_file, {encoding:'utf8'});
	var template = fs.readFileSync(path.join(__dirname, 'temp.txt'), {encoding:'utf8'});

	if(!schema_def) throw new Error('Schema file contains no definitions');

	var schema_defs = schema_def.split('\n###\n');
	schema_defs.forEach( function(sdef) {

		var result = (process_shit(sdef.trim()));
		var file = template.replace(/:schema_name:/g, result.schema_name).replace(/:schema_definition:/, result.schema_attrib_def_normalized);

		console.log("Creating schema: ", result.schema_name);
		fs.writeFileSync(result.schema_name + ".js", file);

	});
	console.log("Schema files created");

}

init();






