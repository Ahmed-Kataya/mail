document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  
  // By default, load the inbox
  // bug it load inbox after send
  
  load_mailbox('inbox');
 
  
  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  sendmail();
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#read-view').innerHTML = ""
  load_emails(mailbox)

}

function sendmail(){

  document.querySelector('form').onsubmit = function() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    //alert(`Hello, ${recipients}`);
    //console.log(recipients,subject,body);
    //
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
       
        
    });
    load_mailbox('sent')
    return false;
    
    //
    
    
  };
  

}

function load_emails(mailbox){
  //console.log(mailbox);
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      //console.log(emails);

  
      // ... do something else with emails ...
      
      
      for (i = 0; i < emails.length; i++) {
        var div = document.createElement('div');
        div.innerHTML = `${emails[i]['sender']} <br> ${emails[i]['subject']} <br> ${emails[i]['timestamp']}`
        div.style.border = "thin solid black";
        div.style.padding = "0px 0px 0px 5px";
        div.style.margin = "1px";
        
        if( !emails[i]['read'] ){
         
          div.style.backgroundColor = "LightGray";
        }
        
        //div.dataset = emails[i]['id']
        div.setAttribute("id", emails[i]['id']);
        const id = emails[i]['id']
        //div.append = emails[i]['subject']
        //container.innerHTML += '<div id="itemSs"></div>';
        
        div.addEventListener('click', ()=>{
          read_mail(id,mailbox)
        });
        document.querySelector('#emails-view').append(div);
      }
      
  });


}

function read_mail(id,mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      //console.log(id);
      console.log(email);
      //email['read'] = false
      var div = document.createElement('div');
      div.innerHTML = `Sender: ${email['sender']} <br> Recipients: ${email['recipients']} <br>Subject: ${email['subject']} <br> ${email['timestamp']}<br> <p>${email['body']}</p> `;
      div.style.border = "thin solid black";
      //border-top: 5px solid red;
      //border-bottom: 5px solid red;
      div.style.padding = "0px 0px 0px 5px";
      div.style.margin = "1px";

      
        
      document.querySelector('#read-view').append(div);
      
      if(mailbox === 'inbox'){
        const but = document.createElement('BUTTON');
        but.className = "btn btn-sm btn-outline-primary";
        but.style.margin = "1px";
        but.textContent = 'Archive';
        
        
        
        document.querySelector('#read-view').append(but)
        but.addEventListener('click', ()=>{
        
        Archive(id);
        
        });
      }
      else if(mailbox === 'archive'){
        const but = document.createElement('BUTTON');
        but.className = "btn btn-sm btn-outline-primary";
        but.style.margin = "1px";
        but.textContent = 'Unarchive';
        
        
        
        document.querySelector('#read-view').append(but)
        but.addEventListener('click', ()=>{
        
        UnArchive(id);
        
        });

      }
     
      

      // ... do something else with email ...
      // change email to read state
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })
      const RPL = document.createElement('BUTTON');
      RPL.className = "btn btn-sm btn-outline-primary";
      RPL.style.margin = "1px";
      RPL.textContent = 'Reply';
      document.querySelector('#read-view').append(RPL)
      RPL.addEventListener('click', ()=>{
        
        Reply(email);
        
      });

  });

}

function Archive(id){
  // console.log("ar");
  // console.log(id);
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  load_mailbox('inbox');
 
}
function UnArchive(id){
  // console.log("un");
  // console.log(id);
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  load_mailbox('inbox');

}

function Reply(email){
  console.log(email)
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  recipient = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');

  recipient.value  = email['sender'];
  recipient.disabled = true;

  sub = email['subject'].slice(0,2);
  if(sub !== 'Re'){
    sub = `Re: ${email['subject']}`;
    //console.log(sub)
  }
  subject.value  = sub;

  str = `On ${email['timestamp']} ${email['sender']} wrote:\n${email['body']}`;
  console.log(str);
  body.value = str;
  sendmail();
 
}