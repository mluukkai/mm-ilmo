#Course = mongoose.model 'Course', CourseSchema	

class CourseController
#	index: (req, res) ->
#		Course.find {}, (err, @courses) =>
#			if err?
#				res.send {}
#			else
#				res.json @courses

exports.CourseController = Koe