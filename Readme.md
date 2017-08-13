## Seqlite [Experimental 🔬⚗]
Seqlite is a simple sequelize model builder. Enables the generation of sequelize models with very "lean" declarations - if braces and object declarations bore you. You can edit / augment the generated files with more sequelize configurations but seqlite provides a quick, easy (,faster?) way to getting started with model file creation.

### Installation
`npm install -g seqlite`

### Usage
`seqlite <optional_schema_definition_file>`

### Schema Definition Files (SDFs)
Seqlite has a small parser that works with SDFs (Files containing the lean sequelize model declarations that become scaffolded into actual modelaname.js files). The SDF syntax is quite easy to understand:
```
modelname
modelattribute1, attribproperty1:value[... ,attribpropertyn:value]
modelattribute2,short_hand_attrib_property
###
anothermodelname
modelattribute, attribproperty1:value[... ,attribpropertyn:value]
```
The SDF dialect for attribproperty1:value / short_hand_attrib_property follows these mappings:
```
var property_map = {
	t:'type',
	pk:'primaryKey',
	ai:'autoIncrement',
	un:'unique',
	an:'allowNull',
	dv:'defaultValue'
};

//todo add more types
var shorthand_key_map = {
	PKD:'t:integer, pk:true, ai:true',
	S:'t:string',
	D:'t:double',
	I:'t:integer',
	U:'un:true',
	A:'an:true',
	T:'t:date'
}
```
Apart from shorthands, any value not in the property key map is used as is, e.g. if you do something like:
```
id, t:integer, somerandomthing:somerandvalue
```
The above will result in an id attribute being defined like so:
```
id:{
    type:DataTypes.INTEGER,
    somerandomthing:"somerandvalue"
}
```

An SDF example looks like so:
```
wallet
id, t:integer, pk:true, autoIncrement:true
username, t:string, un:true, dv:dontsaynever
email, su
expires, ta
###
wallet_ledger
id, pkd
un, su
walletid, ia
```
Assume the above is placed in a file named pp.txt. Running seqlite pp.txt will result in two files being created:
`wallet.js`
```
"use strict"
module.exports = function (sequelize, DataTypes) {
  var schema_definition = {
	"id": {
		"type": DataTypes.INTEGER,
		"primaryKey": "true",
		"autoincrement": "true"
	},
	"username": {
		"type": DataTypes.STRING,
		"unique": "true",
		"defaultValue": "dontsaynever"
	},
	"email": {
		"type": DataTypes.STRING,
		"unique": "true"
	},
	"expires": {
		"type": DataTypes.DATE,
		"allowNull": "true"
	}
};
  var wallet = sequelize.define('wallet', schema_definition,{

     timestamps: true,
     paranoid: true,
     underscored: false,
     freezeTableName: true, 
     classMethods:{ 

      associate: function (models) {
  
      }


     }
  });

  return wallet;
}
```
`wallet_ledger.js`
```
"use strict"
module.exports = function (sequelize, DataTypes) {
  var schema_definition = {
	"id": {
		"type": DataTypes.INTEGER,
		"primaryKey": "true",
		"autoIncrement": "true"
	},
	"un": {
		"type": DataTypes.STRING,
		"unique": "true"
	},
	"walletid": {
		"type": DataTypes.INTEGER,
		"allowNull": "true"
	}
};
  var wallet_ledger = sequelize.define('wallet_ledger', schema_definition,{

     timestamps: true,
     paranoid: true,
     underscored: false,
     freezeTableName: true, 
     classMethods:{ 

      associate: function (models) {
  
      }


     }
  });

  return wallet_ledger;
}
```
[PS: The files are created in the directory `seqlite` is run in]









