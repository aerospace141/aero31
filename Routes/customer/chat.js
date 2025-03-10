const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('../../models/Chat'); // Import the Chat model
const router = express.Router();
const User = require('../../models/user');
// Create HTTP server for Express and Socket.IO
const server = http.createServer(router);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io', // Ensure this is the same as in your client request
});

// Middleware for authentication (example)
const { authenticateUser } = require('../../middleware/authentication');
const { limited_auth } = require('../../middleware/limited_auth');
let triggerUpdate = false;


router.get('/chat/:customerID', async (req, res) => {
  try {

    const customerID = req.params;
    const chats = await Chat.find(customerID);
    triggerUpdate = false; // Reset the trigger after responding

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// const fetchAndProcessChatMessages = async () => {
//   try {
//     const chatMessages = await getMessagesFromDatabase();
//     console.log('Fetched chat messages:', chatMessages);

//   } catch (error) {
//     console.error('Error fetching messages:', error);
//   }
// };

// // Set an interval to run the function every 10 seconds
// // setInterval(fetchAndProcessChatMessages, 10000); // Run every 10 seconds

// const getMessagesFromDatabase = async () => {
//   const messages = await Chat.find(); 
//   return messages;
// };

// // API route to get chat messages for a specific customer
// router.get('/chat/:customerID', async (req, res) => {
//   try {
//     const customerID = req.params.customerID;  // Get customerID from params
//     const messages = await getMessagesFromDatabase(customerID);  // Fetch messages for this customer

//     if (messages && messages.length > 0) {
//       res.status(200).json(messages);  // Return the fetched messages
//     } else {
//       res.status(404).json({ message: 'No messages found for this customer.' });
//     }
//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     res.status(500).json({ error: 'Failed to fetch chats' });
//   }
// });




// Add a new chat message
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const { customerID, receiver, message, senderYou } = req.body;

    if (!customerID || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newChat = new Chat({ 
        customerID, 
        sender: req.ByPhoneNumber,
        receiver,
        message,
        senderYou
    });
    const savedChat = await newChat.save();
    triggerUpdate = true; // Set the trigger

    // io.emit('new-chat', savedChat); 

    res.status(201).json(savedChat);

  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// router.get('/unread-messages/:receiverId', authenticateUser, async (req, res) => {
//   const { receiverId } = req.params;
//   const senderPhone = req.ByPhoneNumber;

//   try {
//     const unreadCount = await Chat.countDocuments({
//       sender: senderPhone, 
//       receiver: receiverId,
//       isRead: false,
//     });

//     res.status(200).json({ unreadCount });
//   } catch (error) {
//     console.error('Error fetching unread messages:', error.message);
//     res.status(500).json({ error: 'Failed to fetch unread) messages' });
//   }
// });

// router.put('/mark-messages-as-read', async (req, res) => {
//   const { customerID } = req.body;

//   try {
//     await Chat.updateMany(
//       { customerID, isRead: false },
//       { $set: { isRead: true } }
//     );

//     res.status(200).json({ message: 'Messages marked as read' });
//   } catch (error) {
//     console.error('Error marking messages as read:', error.message);
//     res.status(500).json({ error: 'Failed to mark messages as read' });
//   }
// });

 // Ensure correct path to Chat model

 router.get('/unread-messages/:receiverId', authenticateUser, async (req, res) => {
  const { receiverId } = req.params;
  const currentUserPhone = req.ByPhoneNumber; // Assuming `authenticateUser` attaches user info

  try {
    // Correct query: You are the receiver
    const unreadCount = await Chat.countDocuments({
     receiver: currentUserPhone, 
      sender: receiverId,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

router.get('/unread-messages/two/:receiverId', authenticateUser, async (req, res) => {
  const { receiverId } = req.params;
  const currentUserPhone = req.ByPhoneNumber; // Assuming `authenticateUser` attaches user info

  try {
    // Correct query: You are the receiver
    const unreadCount = await Chat.countDocuments({
     sender: receiverId, 
      receiver: currentUserPhone,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});


 router.post('/unread-messages', authenticateUser, async (req, res) => {
  try {
    const { customerPhones } = req.body; // Array of customer phone numbers
    const senderPhone = req.ByPhoneNumber; // Logged-in user's phone number (you are the sender)

    // Ensure `customerPhones` is an array
    if (!Array.isArray(customerPhones) || customerPhones.length === 0) {
      return res.status(400).json({ message: 'customerPhones must be a non-empty array' });
    }

    // Query unread messages where the logged-in user is the sender
    const unreadCounts = await Chat.aggregate([
      {
        $match: {
          sender: senderPhone,              // You are the sender
          receiver: { $in: customerPhones }, // Match customers as receivers
          isRead: false,                    // Only unread messages
        },
      },
      {
        $group: {
          _id: '$receiver', // Group by receiver (customer phone number)
          count: { $sum: 1 }, // Count unread messages for each receiver
        },
      },
    ]);

    // Convert aggregated data into a readable object
    const result = unreadCounts.reduce((acc, item) => {
      acc[item._id] = item.count; // Map receiver phone numbers to their unread counts
      return acc;
    }, {});

    res.status(200).json({ unreadCounts: result });
  } catch (error) {
    console.error('Error fetching unread message counts:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.put('/mark-messages-read/:senderId', authenticateUser, async (req, res) => {
  const { senderId } = req.params;
  const currentUserPhone = req.ByPhoneNumber; // Authenticated user's phone number

  try {
    // Update all unread messages where the logged-in user is the receiver and the sender matches
    await Chat.updateMany(
      { sender: senderId, receiver: currentUserPhone, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
    console.error('send and current',senderId, currentUserPhone);
  } catch (error) {
    console.error('Error marking messages as read:', error.message);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});



router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send a "ping" event to keep the connection alive
  res.write('event: ping\ndata: {}\n\n');

  // Watch MongoDB for changes
  const changeStream = Chat.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const { sender, receiver, message, isRead, customerID, timestamp, senderYou } = change.fullDocument;

      // If the message is unread, notify the client
      if (!isRead) {
        res.write(
          `data: ${JSON.stringify({
            sender,
            receiver,
            customerID,
            timestamp,
            senderYou,
            isRead,
            message,
            
          })}\n\n`
        );
      }
    }
  });

  // Close the connection when the client disconnects
  req.on('close', () => {
    console.log('SSE connection closed.');
    changeStream.close();
    res.end();
  });
});


const sendSSE = (res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send events every 5 seconds
  setInterval(() => {
    const data = {
      message: `New message at ${new Date().toISOString()}`
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 5000); // 5 seconds interval

  // Keep the connection alive
  res.flushHeaders();
};

// Define the route to handle SSE connections
router.get('/events/massage', (req, res) => {
  sendSSE(res);
});


// Migrate receiver IDs to phone numbers




module.exports = router;
