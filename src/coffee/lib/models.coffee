global.mongoose = require('mongoose')
global.Schema = mongoose.Schema
global.ObjectId = Schema.ObjectId

CourseSchema = new Schema
	id: ObjectId
	name: String
	term: String
	active: Boolean
	teachers: [String]
	lectures: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Lecture'
	]
	participants: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Student'
	]
	created_at:
		type: Date
		default: Date.now
	, 
	{ usePushEach: true }		

LectureSchema = new Schema
	id: ObjectId
	time: String
	date: String
	place: String
	seminar: Boolean
	speaker: String
	chair: String
	opponent: String
	course:
		type: mongoose.Schema.Types.ObjectId
		ref: 'Course'
	participants: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Student'
	]
	created_at:
		type: Date
		default: Date.now
	, { usePushEach: true }	

StudentSchema = new Schema
	id: ObjectId
	first_name: String
	last_name: String
	name: String
	number: String
	created_at:
		type: Date
		default: Date.now	
	, 
	{ usePushEach: true }	

UserSchema = new Schema
	id: ObjectId
	name: String
	password: String
	, 
	{ usePushEach: true }	

User = mongoose.model 'User', CourseSchema
Course = mongoose.model 'Course', CourseSchema
Lecture = mongoose.model 'Lecture', LectureSchema
Student = mongoose.model 'Student', StudentSchema

exports.User = User
exports.Course = Course
exports.Lecture = Lecture
exports.Student = Student