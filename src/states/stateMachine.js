const stateMachine = {
    currentState: {},
    states: {
        INITIAL: {
            prompt: "Welcome! Type 'help me' for assistance.",
            onMessage: function (message) { // Use a regular function
                if (message.toLowerCase() === "help me") {
                    stateMachine.currentState = stateMachine.states.HELP; // Use stateMachine to reference the main object
                    return "How can I assist you?";
                }
                return "I'm not sure how to help with that. Type 'help me' for assistance.";
            }
        },
        HELP: {
            prompt: "You are in the help state.",
            onMessage: function (message) { // Use a regular function
                if (message.toLowerCase() === "exit") {
                    stateMachine.currentState = stateMachine.states.INITIAL; // Use stateMachine to reference the main object
                    return "Returning to the main menu. Type 'help me' for assistance.";
                }
                return "Please specify what you need help with.";
            }
        }
    },
    handleMessage: function (from, message) {
        const text = message.text.body.toLowerCase(); // Ensure message text is lowercase
        return this.currentState.onMessage(text); // Access currentState and call onMessage
    }
};

// Initialize the starting state
stateMachine.currentState = stateMachine.states.INITIAL;

module.exports = stateMachine;
