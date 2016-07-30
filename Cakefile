{exec} = require 'child_process'

task 'build', 'Build the .js files', (options) ->
	exec "coffee --compile --bare --map --output webclient/ client_src/", (err, stdout, stderr) ->
		if err
		    throw err
		else
		    console.log stdout + stderr
		    console.log "Compiled client coffeescript files to javascript!"

task 'restoreDB', 'Restore database from dump', (options) ->
	exec "mongo webstrate --eval 'db.dropDatabase()' && mongorestore --db=webstrate --collection=webstrates dump/webstrate/webstrates.bson", (err, stdout, stderr) ->
		if err
		    throw err
		else
		    console.log stdout + stderr
		    console.log "Restored database from dump!"

task 'restoreDB', 'Restore database from dump', (options) ->
	exec "mongo webstrate --eval 'db.dropDatabase()' && mongorestore --db=webstrate --collection=webstrates dump/webstrate/webstrates.bson", (err, stdout, stderr) ->
		if err
		    throw err
		else
		    console.log stdout + stderr
		    console.log "Restored database from dump!"
