import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestingStore = defineStore("testingStore", () => {
    const users = ref([
        {
            username: "Test User",
            email: "test.user@gmail.com",
            password: "Test123!",
        },
    ]);

    function logUser(email, password) {
        const user = users.value.find((u) => u.email === email);
        return user && user.password === password;
    }

    function addUser(username, email, password) {
        users.value.push({
            username: username,
            email: email,
            password: password,
        });
    }

    return {
        logUser,
        addUser,
    };
});
