class Todo {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.term = "";
        this.list = document.getElementById("taskList");
        this.draw();
    }

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    add(text, date) {
        const t = (text || "").trim();

        if (t.length < 3 || t.length > 255) {
            alert("Zadanie musi mieć 3–255 znaków");
            return;
        }

        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const d = new Date(date);
            if (isNaN(d.getTime()) || d <= today) {
                alert("Data musi być pusta albo w przyszłości");
                return;
            }
        }

        this.tasks.push({ text: t, date: date || "" });
        this.save();
        this.draw();
    }


    removeByIndex(realIndex) {
        this.tasks.splice(realIndex, 1);
        this.save();
        this.draw();
    }

    updateByIndex(realIndex, text, date) {
        const t = (text || "").trim();

        if (t.length < 3 || t.length > 255) {
            alert("Zadanie musi mieć 3–255 znaków");
            this.draw();
            return;
        }
        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const d = new Date(date);
            if (isNaN(d.getTime()) || d <= today) {
                alert("Data musi być pusta albo w przyszłości");
                this.draw();
                return;
            }
        }

        this.tasks[realIndex] = { text: t, date: date || "" };
        this.save();
        this.draw();
    }

    get filteredTasksWithIndex() {
        const term = this.term.trim().toLowerCase();
        if (term.length < 2) {
            return this.tasks.map((t, idx) => ({ ...t, idx }));
        }
        return this.tasks
            .map((t, idx) => ({ ...t, idx }))
            .filter(t => t.text.toLowerCase().includes(term));
    }

    highlight(text) {
        const term = this.term.trim();
        if (term.length < 2) return this.escapeHtml(text);

        const safeText = this.escapeHtml(text);
        const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(${safeTerm})`, "gi");
        return safeText.replace(re, `<span class="highlight">$1</span>`);
    }

    escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    draw() {
        this.list.innerHTML = "";

        this.filteredTasksWithIndex.forEach((task) => {
            const li = document.createElement("li");

            const content = document.createElement("div");
            content.className = "task-content";
            content.innerHTML = this.highlight(task.text);

            if (task.date) {
                const d = document.createElement("span");
                d.className = "date";
                d.textContent = ` (${task.date})`;
                content.appendChild(d);
            }

            content.addEventListener("click", (e) => {
                e.stopPropagation();
                this.editTask(task.idx, li);
            });

            const del = document.createElement("button");
            del.type = "button";
            del.textContent = "🗑";
            del.addEventListener("click", (e) => {
                e.stopPropagation();
                this.removeByIndex(task.idx);
            });

            li.appendChild(content);
            li.appendChild(del);
            this.list.appendChild(li);
        });
    }

    editTask(realIndex, li) {
        const task = this.tasks[realIndex];

        // Jeżeli już edytujemy ten sam wiersz, return
        if (li.dataset.editing === "1") return;
        li.dataset.editing = "1";

        // Zapamiętaj poprzednią zawartość, gdyby trzeba było przywrócić
        const oldHtml = li.innerHTML;

        // Czyścimy TYLKO ten jeden li a nie całą listę
        li.innerHTML = "";

        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;

        const date = document.createElement("input");
        date.type = "date";
        date.value = task.date || "";

        li.appendChild(input);
        li.appendChild(date);

        input.focus();

        const finish = () => {
            li.dataset.editing = "0";
            document.removeEventListener("click", outsideClickHandler, true);
            this.updateByIndex(realIndex, input.value, date.value);
            // updateByIndex() i tak robi draw(), więc lista się odświeży
        };

        const cancel = () => {
            li.dataset.editing = "0";
            document.removeEventListener("click", outsideClickHandler, true);
            li.innerHTML = oldHtml;
            // przywraca stary wygląd bez zapisu
        };

        // Enter = zapisz, Esc = anuluj
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") finish();
            if (e.key === "Escape") cancel();
        });

        const outsideClickHandler = (e) => {
            if (!li.contains(e.target)) finish();
        };

        document.addEventListener("click", outsideClickHandler, true);
    }

}

// INIT
const todo = new Todo();

document.getElementById("addBtn").addEventListener("click", () => {
    todo.add(
        document.getElementById("newTask").value,
        document.getElementById("newDate").value
    );
    document.getElementById("newTask").value = "";
    document.getElementById("newDate").value = "";
});

document.getElementById("search").addEventListener("input", (e) => {
    todo.term = e.target.value;
    todo.draw();

});
