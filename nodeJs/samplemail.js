var postmark = require("postmark");
var client = new postmark.Client("b8458926-dc13-441b-b74c-2d92de2516e5");
 
client.sendEmail({
    "From": "admin@iniwu.com", 
    "To": "abhial1997@gmail.com", 
    "Subject": "JOB OFFER", 
    "TextBody": "Hello, \n\n\tCongratulation You have been hired by GOOGLE INDIA and we are offering you 39 lac. LPA. If you are ready to join please give party to Mr. RISHABH KUMAR SHARMA. As, he is recommended you for this job. Please do not reply to this mail. We will contact you immediately. But remember to give party to RISHABH KUMAR SHRAMA.\n\n Thank You",
});
