let p, v, m;
let q_text, q_ansa, q_ansb, q_ansc, q_ansd, q_radio, q_type;
let e_text, e_ansa, e_ansb, e_ansc, e_ansd, check_q, container;
let rights, wrongs, requestURL;
let current = rights = wrongs = 0;

document.addEventListener('DOMContentLoaded', function () {
    container = document.getElementById('exam_box');
    m = new examModel();
    p = new examPresenter();
    v = new examView(p);
    p.setModelAndView(m, v);
    v.setHandler();


});

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ MODEL *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ Datenbankkommunikation *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~

class examModel {
    constructor() {

        this.frage = [];
        requestURL = 'https://api.myjson.com/bins/ur4qw';

    }

    getJSON() {

        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        request.onload = function () {
            let jsonarray = request.response;

            if (Notification.permission === 'granted') {
                navigator.serviceWorker.getRegistration().then(function (reg) {
                    reg.showNotification('JSON erfolgreich geladen.');
                });
            }
            m.setQuestions(jsonarray);
        };
    }

    setQuestions(data) {
        let i;
        for (i = 0; i < data.length; i++) {
            console.log('ID dieser Frage ist...', data[i].id);
            this.frage.push([data[i].id, data[i].question, data[i].answera, data[i].answerb, data[i].answerc,
                data[i].answerd, data[i].type, data[i].rights]);
        }


        p.setQuestions(data);
    }

    updateModel(data) {
        this.frage.push(data);

    }

}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ VIEW *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ DOM Manipulation *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~

class examView {
    constructor(presenter) {
        this.vp = presenter;
        this.vfrage = [];
    }

    setHandler() {

        //Input-Handler
        q_text = document.getElementById('q_text');
        q_ansa = document.getElementById('q_ansA');
        q_ansb = document.getElementById('q_ansB');
        q_ansc = document.getElementById('q_ansC');
        q_ansd = document.getElementById('q_ansD');
        q_radio = document.getElementsByName('q_type');

        //Startup-Buttons
        let startup = document.getElementsByClassName('startup_button');
        for (let i = 0; i < startup.length; i++) {
            let ele = startup[i];
            ele.addEventListener('click', function () {
                v.vp.dataChoice(ele.value);
                document.getElementById('startup_box').style.display = 'none';
                document.getElementById('tab').style.display = "block";
                let x = document.getElementsByClassName('tablinks');
                for (let j = 0; j < x.length; j++) {
                    x[j].disabled = false;
                }
            });
        }

        //Save-Button
        document.getElementById("save_button").addEventListener("click", function () {
            v.vp.saveQuestion();
        });

        //Statistik-Button
        document.getElementById('statistic_button').addEventListener("click", function () {
            v.showStatistic();
        });

        //Next-Button
        document.getElementById('next_button').addEventListener('click', function () {
            v.nextQuestion();
        });

        document.getElementById('start_button').addEventListener('click', function () {
            v.renderQuestion();
            document.getElementById('next_button').style.display = "block";
            document.getElementById('start_button').style.display = "none";
        });

        document.getElementById('again_button').addEventListener('click', function () {
            current = rights = wrongs = 0;
            v.clear('container');
            v.renderQuestion();
            document.getElementById('ex_tab').click();
            document.getElementById('next_button').style.display = "block";
            document.getElementById('statistic_button').disabled = true;
        });

        document.getElementById('next_button').style.display = "none";


    }

    openTab(evt, id) {
        var i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        document.getElementById(id).style.display = "block";
        evt.currentTarget.className += " active";
    }

    clear(type) {
        if (type === 'inputs') {
            q_text.value = q_ansa.value = q_ansb.value = q_ansc.value = q_ansd.value = "";
        }

        if (type === 'container') {
            container.innerHTML = "";
        }
    }

    nextQuestion() {
        current = current + 1;

        let tobechecked;

        for (let i = 0; i < this.vfrage.length; i++) {
            if (this.vfrage[i][1] === e_text.value) {
                tobechecked = this.vfrage[i];
            }
        }

        this.vp.checkQuestion(tobechecked, check_q);
        this.clear('container');

        if (current === this.vfrage.length) {
            document.getElementById('next_button').style.display = "none";
            document.getElementById('statistic_button').disabled = false;
            //Ende der Fragen erreicht, keine neue Frage rendern.
        } else {

            this.renderQuestion();
            check_q = "";
            // Ende noch nicht erreicht, render neue Frage und resette check_q.
        }

    }

    showStatistic() {

        let s_b = document.createElement('div');
        s_b.setAttribute('class', 'statistic_value');
        s_b.innerHTML = `Du hast ${rights} von ${rights + wrongs} Fragen richtig beantwortet.`;
        document.getElementById('statistic_box').appendChild(s_b);
        document.getElementById('stat_tab').click();

        for (let i = 0; i < this.vfrage.length; i++) {
            if (this.vfrage[i][7] >= 5) {
                document.getElementById('delete_box').style.display = "block";

                let x = document.createElement('div');
                let y = document.createElement('p');
                let z = document.createElement('button');

                x.setAttribute('class', 'delete_qu');
                z.setAttribute('class', 'btn');
                z.setAttribute('id', 'delete_button');

                let toBeDeleted;
                x.textContent = toBeDeleted = this.vfrage[i][1];
                z.textContent = 'X';
                x.appendChild(y);
                x.appendChild(z);
                document.getElementById('delete_box').appendChild(x);

                z.addEventListener('click', function () {
                    let r = confirm("Wirklich löschen?");
                    if (r === true) {
                        p.deleteQuestion(toBeDeleted);

                        let delete_box = document.getElementsByClassName('delete_qu');
                        for (let i = 0; i < delete_box.length; i++) {
                            let ele = delete_box[i];
                            if (delete_box[i].textContent === toBeDeleted) {
                                delete_box[i].remove();
                            }
                        }
                    }
                });
            }
        }
    }

    updateView(data) {

        this.vfrage.push(data);
    }

    renderQuestion() {

        let e_div = document.createElement('div');
        e_div.setAttribute('class', 'ex_qu');
        e_text = document.createElement('div');
        e_ansa = document.createElement('button');
        e_ansa.setAttribute('class', 'e_ansa e_btn');
        e_ansb = document.createElement('button');
        e_ansb.setAttribute('class', 'e_ansb e_btn');
        e_ansc = document.createElement('button');
        e_ansc.setAttribute('class', 'e_ansc e_btn');
        e_ansd = document.createElement('button');
        e_ansd.setAttribute('class', 'e_ansd e_btn');

        let mixer = [];
        let random = Math.floor((Math.random() * 4) + 2);

        if (random === 2) {
            mixer = [3, 5, 2, 4];
        }
        if (random === 3) {
            mixer = [5, 4, 2, 3];
        }
        if (random === 4) {
            mixer = [4, 3, 5, 2];
        }
        if (random === 5) {
            mixer = [2, 4, 5, 3];
        }

        e_ansa.textContent = this.vfrage[current][mixer[0]];
        e_ansb.textContent = this.vfrage[current][mixer[1]];
        e_ansc.textContent = this.vfrage[current][mixer[2]];
        e_ansd.textContent = this.vfrage[current][mixer[3]];

        e_ansa.addEventListener('click', function () {
            check_q = e_ansa.textContent;
        });
        e_ansb.addEventListener('click', function () {
            check_q = e_ansb.textContent;
        });
        e_ansc.addEventListener('click', function () {
            check_q = e_ansc.textContent;
        });
        e_ansd.addEventListener('click', function () {
            check_q = e_ansd.textContent;
        });

        if (this.vfrage[current][6] === 'text') {
            e_text.setAttribute('class', 'e_text');
            e_text.textContent = e_text.value = this.vfrage[current][1];
            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);
            container.appendChild(e_div);
        }

        if (this.vfrage[current][6] === 'math') {
            e_text.setAttribute('class', 'e_math');
            e_text.value = this.vfrage[current][1];
            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);
            container.appendChild(e_div);

            this.renderMath(this.vfrage[current][1], e_text);
        }

        if (this.vfrage[current][6] === 'sheet') {
            e_text.value = this.vfrage[current][1];
            e_text.setAttribute('id', 'sheet_canvas');
            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);
            container.appendChild(e_div);

            let valueWithOctave = this.vfrage[current][1];
            let octave = Math.floor(Math.random() * 3) + 3;
            if (!valueWithOctave.includes('/')) {
                valueWithOctave = valueWithOctave + '/' + octave.toString();
                console.log('valueWithOctave: ', valueWithOctave);
            }
            this.renderSheet(valueWithOctave);
        }
    }

    renderSheet(note) {
        const VF = Vex.Flow;

        const div = document.getElementById('sheet_canvas');
        const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        renderer.resize(120, 150);

        const context = renderer.getContext();
        context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

        const stave = new VF.Stave(10, 10, 100);
        stave.addClef('treble');
        stave.setContext(context).draw();

        let notes = [
            new VF.StaveNote({
                keys: [note],
                duration: 'q'
            })
        ];

        const voice = new VF.Voice({num_beats: 1, beat_value: 4});
        voice.addTickables(notes);
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 50);
        voice.draw(context, stave);

    }

    renderMath(formula, element) {
        katex.render(formula, element, {
            throwOnError: false
        });
    }


}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ PRESENTER *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ Event Handling *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
class examPresenter {
    constructor() {

    }

    setModelAndView(model, view) {
        this.pv = view;
        this.pm = model;
    }

    dataChoice(value) {

        if (value === 'json') {
            this.pm.getJSON();
        }
    }

    setQuestions(data) {
        // this.pv.vfrage = this.pm.frage;

        for (let i = 0; i < data.length; i++) {
            console.log('ID dieser Frage ist...', data[i].id);
            this.pv.vfrage.push([data[i].id, data[i].question, data[i].answera, data[i].answerb,
                data[i].answerc, data[i].answerd, data[i].type, data[i].rights]);
        }

    }


    saveQuestion() {

        for (let i = 0; i < q_radio.length; i++) {
            if (q_radio[i].checked) {
                q_type = q_radio[i].value;
            }
        }

        let newdata = [(this.pv.vfrage.length + 1), q_text.value, q_ansa.value, q_ansb.value,
            q_ansc.value, q_ansd.value, q_type];

        this.pv.clear('inputs');
        this.updateQuestions(newdata);
    }

    updateQuestions(data) {
        this.pm.updateModel(data);
        this.pv.updateView(data);
    }

    checkQuestion(array, answer) {

        if (array) {
            if (answer === array[2]) {
                rights = rights + 1;

                array[7] = array[7] + 1;

                for (let i = 0; i < this.pm.frage.length; i++) {
                    if (array[1] === this.pm.frage[i][1]) {
                        this.pm.frage[i][7] = this.pv.vfrage[i][7] = array[7];
                    }
                }
            } else {
                wrongs = wrongs + 1;
            }
        } else {
            window.alert('Please answer.');
        }

    }

    deleteQuestion(question) {

        for (let x = 0; x < this.pv.vfrage.length; x++) {
            if (this.pv.vfrage[x][1] === question) {
                this.pv.vfrage.splice(x, 1);
            }
        }
    }

}
