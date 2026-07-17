import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestingStore = defineStore("testingStore", () => {
    const loggedUser = ref(false);

    const users = ref([
        {
            username: "Test User",
            email: "test.user@gmail.com",
            password: "Test123!",
        },
    ]);

    function logUser(email, password) {
        const user = users.value.find((u) => u.email === email);

        if (user && user.password === password) loggedUser.value = user;
        return loggedUser.value;
    }

    function addUser(username, email, password) {
        users.value.push({
            username: username,
            email: email,
            password: password,
        });
    }

    return {
        loggedUser,
        logUser,
        addUser,
    };
});
