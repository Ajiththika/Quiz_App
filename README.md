#  Quiz App - Online Quiz Game

A modern, interactive online quiz game built with HTML, CSS, and JavaScript. Test your knowledge with 10 general knowledge questions in a beautifully designed interface with real-time scoring and detailed answer review.

## Features

-  **Login Authentication** - Secure login system with form validation
-  **10 Quiz Questions** - General knowledge questions from various topics
-  **Modern UI Design** - Gradient backgrounds with glassmorphism effects
-  **Smooth Animations** - Polished transitions and micro-interactions
-  **Real-time Scoring** - Track your score as you progress
-  **Navigation Controls** - Move between questions with state preservation
-  **Visual Feedback** - Clear indicators for correct/incorrect answers
-  **Answer Review** - Detailed review of all questions and answers
-  **Restart Quiz** - Reset and replay without page refresh
-  **Responsive Design** - Works perfectly on mobile, tablet, and desktop

## Live Demo

Visit the live application: https://ajiththika.github.io/Quiz_App/

## Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with custom properties, animations, and flexbox
- **JavaScript (ES6+)** - Application logic and DOM manipulation
- **JSON** - Quiz data storage and dynamic loading

##  Project Structure

```
Quiz app/
├── index.html        # Landing page
├── login.html        # Authentication page
├── quiz.html         # Main quiz interface
├── style.css         # Complete styling system
├── script.js         # Application logic
├── questions.json    # Quiz questions data
└── README.md         # Project documentation
```

##  How to Use

1. **Start the Quiz**
   - Click "Attempt Quiz" on the landing page
   
2. **Login**
   - Enter any username and password
   - Form validation ensures all fields are filled
   
3. **Take the Quiz**
   - Answer each question by clicking an option
   - Get immediate feedback on your answer
   - Use Next/Previous buttons to navigate
   
4. **View Results**
   - See your final score after completing all questions
   - Review all questions with your answers vs correct answers
   
5. **Restart or Logout**
   - Restart the quiz to try again
   - Logout to return to login page

##  Local Development

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)

### Setup
> [!IMPORTANT]
> Because this application uses the `fetch` API to load JSON data, browser security policies (CORS) require it to be run on a local server. You cannot simply open the `index.html` file directly.

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quiz-app
   ```

2. **Run on a Local Server**

   **Option A: Using VS Code Live Server (Recommended)**
   - Install the "Live Server" extension in VS Code.
   - Right-click `index.html` and select "Open with Live Server".

   **Option B: Using Node.js http-server**
   ```bash
   npx http-server .
   ```


##  Key Features Breakdown

### Authentication System
- Form validation for empty fields
- localStorage-based session management
- Authentication guard for quiz access
- Logout functionality

### Quiz Logic
- Dynamic question loading from JSON
- One question at a time display
- Answer selection with visual feedback
- State preservation during navigation
- Prevent double score counting

### Scoring System
- Real-time score updates
- Accurate answer validation
- Final score with personalized message
- Color-coded review section

### User Interface
- Glassmorphism card design
- Gradient backgrounds
- Smooth animations on all interactions
- Responsive layout for all devices
- Clear visual hierarchy

##  Code Highlights

### Clean JavaScript Functions
```javascript
// Modular functions with clear responsibilities
- checkAuth()          // Authentication verification
- loadQuestions()      // Fetch quiz data
- renderQuestion()     // Display current question
- selectOption()       // Handle answer selection
- showResults()        // Display final score
- restartQuiz()        // Reset application state
```

### CSS Custom Properties
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-color: #10b981;
  --error-color: #ef4444;
  /* ... and more */
}
```

### Dynamic Question Structure
```json
{
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correct": 2
}
```

##  Testing

All features have been thoroughly tested:
- ✅ Login validation (empty fields)
- ✅ Authentication guard
- ✅ Question loading and display
- ✅ Answer selection and feedback
- ✅ Score calculation accuracy
- ✅ Navigation (Next/Previous)
- ✅ State preservation
- ✅ Results display
- ✅ Answer review
- ✅ Restart functionality
- ✅ Logout functionality
- ✅ Responsive design

##  Design System

### Color Palette
- **Primary**: Purple-blue gradient (#667eea to #764ba2)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Background**: Dark navy (#0f172a)

### Typography
- **Font Family**: Segoe UI, system fonts
- **Headings**: Bold, gradient text
- **Body**: Clean, readable sizes

##  Future Enhancements

- [ ] Add timer for each question
- [ ] Multiple quiz categories
- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] Sound effects for feedback
- [ ] Social media sharing
- [ ] Leaderboard system
- [ ] Dark/Light theme toggle
- [ ] More question categories

