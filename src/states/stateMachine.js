const stateMachine = {
    currentState: {},
    states: {
        INITIAL: {
            prompt: "Welcome! Type 'help me' for assistance.",
            onMessage: (message) => {
                if (message.toLowerCase() === "help me") {
                    this.currentState = this.states.HELP;
                    return "How can I assist you?";
                }
                return "I'm not sure how to help with that. Type 'help me' for assistance.";
            }
        },
        HELP: {
            prompt: "You are in the help state.",
            onMessage: (message) => {
                if (message.toLowerCase() === "exit") {
                    this.currentState = this.states.INITIAL;
                    return "Returning to the main menu. Type 'help me' for assistance.";
                }
                return "Please specify what you need help with.";
            }
        }
    },
    handleMessage: function (from, message) {
        const text = message.text.body;
        return this.states[this.currentState.name].onMessage(text);
    }
}
module.exports = new StateMachine();