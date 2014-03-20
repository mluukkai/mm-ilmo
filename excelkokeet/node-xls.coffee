xlsx = require('node-xlsx');

student = (data) ->
	"#{data[0].value} #{data[2].value} #{data[3].value}"

data = xlsx.parse(__dirname + '/students.xlsx')

#console.log data

isStudent = (s) ->
	nro = s[0].value
	(typeof nro == 'number') and (nro.toString().charAt(0)=='1' )

for s in data.worksheets[0].data
	if isStudent(s)
		console.log student(s)
