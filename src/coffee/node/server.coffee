app = global.app

app.get '/lol', (req,res) ->
	res.send "Hello word!"

app.get '/lolli', (req,res) ->
	res.send "Lol word!"

app.get '/kolli', (req,res) ->
	res.send "Lol word!"

app.get '/foo', (req,res) ->
	res.render 'index', layout: false	