const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
	try {


		 console.log("KEY:", process.env.API_KEY);
    console.log("SECRET:", process.env.API_SECRET);
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	} catch (error) {
		console.log(error);
	}
};