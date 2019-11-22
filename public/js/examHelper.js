// require('stream');


let p, v, m;
let q_text, q_ansa, q_ansb, q_ansc, q_ansd, q_radio, q_type;
let e_text, e_ansa, e_ansb, e_ansc, e_ansd, check_q, container;
let rights, wrongs, requestURL;
let current = rights = wrongs = 0;

document.addEventListener('DOMContentLoaded', function () {
    //let db = new sqlite3.Database(':memory:');
    container = document.getElementById('exam_box');
    m = new examModel();
    p = new examPresenter();
    v = new examView(p);
    p.setModelAndView(m, v);
    p.setQuestions();
    v.setHandler();


});

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ MODEL *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ Datenbankkommunikation *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~

class examModel {
    constructor() {
        // this.frage = [
        //     ["2x+x", "3x", "2x+x", "2x^2", "x", "math", 2],
        //     ["D/4", "D", "E", "F", "F#", "sheet", 4],
        //     ["Bird?", "Vogel", "Wurm", "Baum", "Bürde", "text", 0],
        //     ["x^2+x^2", "2x^2", "x^4", "x^8", "2x^4", "math", 1],
        //     ["C/4", "C", "D", "F", "G", "sheet", 0]
        // ];

        this.frage = [];
        requestURL = 'https://api.myjson.com/bins/yutva';

    }

    // ["2x+x",      "3x",            "2x+x", "2x^2", "x",      "math",        2],

    //  ^ question    ^ solution            ^ answers b-d         ^ type       ^ amount of correctly answered

    getJSON() {

        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        request.onload = function () {
            let jsonarray = request.response;
            console.log('Got from JSON... : ', jsonarray);
            console.log('Got from JSON[0].question... : ', jsonarray[0].question);
            console.log('Got from JSON length... : ', jsonarray.length);

            m.setQuestions(jsonarray);
        };


    }

    setQuestions(data) {
        let i;
        for (i = 0; i < data.length; i++) {
            this.frage.push([data[i].question, data[i].answera, data[i].answerb, data[i].answerc, data[i].answerd, data[i].type, data[i].rights]);
        }

        console.log('Frage-Array is now...:', this.frage);

    }

    createFile() {
        window.alert('TBA: Eigene lokale Datei erstellen.\n (Bisher ists aber so, dass es einfach nur über ein einzelnen Array läuft, was beim Reload wieder gelöscht wird.)');
    }

    saveQuestionM(data) {
        this.frage.push(data);
    }

    updateQuestionsM() {
        return [...this.frage];
        //returns copy of frage array

    }

}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ VIEW *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ DOM Manipulation *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~

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

        //Startup Buttons

        let startup = document.getElementsByClassName('startup_button');
        for (let i = 0; i < startup.length; i++) {
            let ele = startup[i];
            ele.addEventListener('click', function () {
                v.vp.dataChoice(ele.value);
                document.getElementById('startup_box').style.display = 'none';
                document.getElementById('tab').style.display="block";
                let x = document.getElementsByClassName('tablinks');
                for (let j = 0; j < x.length; j++) {
                    x[j].disabled = false;
                }

            });
        }


        //Button-Handler

        //Save-Button und leite weiter an Presenters SaveQuestion.
        document.getElementById("save_button").addEventListener("click", function () {
            v.vp.saveQuestion();
        });

        //Statistik-Button, sofort umschalten auf Statistik Tab...joa.
        document.getElementById('statistic_button').addEventListener("click", function () {
            //v.vp.startStatistic();
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


    update(data) {

        this.vfrage.push(data);
        console.log('new array in view:', this.vfrage);
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

        //elements must be newly created every single time!
        //otherwise only one will be created and added.

        e_ansa.textContent = this.vfrage[current][1];
        e_ansb.textContent = this.vfrage[current][2];
        e_ansc.textContent = this.vfrage[current][3];
        e_ansd.textContent = this.vfrage[current][4];

        e_ansa.addEventListener('click', function () {
            check_q = e_ansa.textContent;
            console.log(check_q);
        });
        e_ansb.addEventListener('click', function () {
            check_q = e_ansb.textContent;
            console.log(check_q);
        });
        e_ansc.addEventListener('click', function () {
            check_q = e_ansc.textContent;
            console.log(check_q);
        });
        e_ansd.addEventListener('click', function () {
            check_q = e_ansd.textContent;
            console.log(check_q);
        });

        if (this.vfrage[current][5] === 'text') {

            e_text.setAttribute('class', 'e_text');

            e_text.textContent = e_text.value = this.vfrage[current][0];


            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);

            container.appendChild(e_div);

        }

        if (this.vfrage[current][5] === 'math') {
            e_text.setAttribute('class', 'e_math');
            e_text.value = this.vfrage[current][0];

            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);

            container.appendChild(e_div);

            this.renderMath(this.vfrage[current][0], e_text);

        }

        if (this.vfrage[current][5] === 'sheet') {

            e_text.value = this.vfrage[current][0];
            e_text.setAttribute('id', 'sheet_canvas');

            e_div.appendChild(e_text);
            e_div.appendChild(e_ansa);
            e_div.appendChild(e_ansb);
            e_div.appendChild(e_ansc);
            e_div.appendChild(e_ansd);

            container.appendChild(e_div);


            this.renderSheet(this.vfrage[current][0]);

        }
    }

    renderSheet(note) {
        const VF = Vex.Flow;

        // Create an SVG renderer and attach it to the DIV element named "boo".
        //const div = document.getElementById(canvas);
        const div = document.getElementById('sheet_canvas');
        console.log(div);
        const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

        // Configure the rendering context.
        renderer.resize(120, 150);
        const context = renderer.getContext();
        context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

        // Create a stave of width 400 at position 10, 40 on the canvas.
        const stave = new VF.Stave(10, 10, 100);

        // Add a clef and time signature.
        // stave.addClef('treble').addTimeSignature('4/4');
        stave.addClef('treble');

        // const noteValue = this.sheetValueRef.nativeElement.innerText;
        // console.log(noteValue);
        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();

        let notes = [
            new VF.StaveNote({
                keys: [note],
                duration: 'q'
            })
        ];

        // Create a voice in 4/4 and add above notes
        const voice = new VF.Voice({num_beats: 1, beat_value: 4});
        voice.addTickables(notes);

        // Format and justify the notes to 400 pixels.
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 50);

        // Render voice
        voice.draw(context, stave);

    }

    renderMath(formula, element) {
        katex.render(formula, element, {
            throwOnError: false
        });
    }

    nextQuestion() {
        current = current + 1;

        let tobechecked;

        for (let i = 0; i < this.vfrage.length; i++) {
            if (this.vfrage[i][0] === e_text.value) {
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

        console.log('Right questions: ', rights);
        console.log('Wrong questions: ', wrongs);

        let s_b = document.createElement('div');
        s_b.setAttribute('class', 'statistic_value');
        s_b.innerHTML = `Du hast ${rights} von ${rights + wrongs} Fragen richtig beantwortet.`;
        document.getElementById('statistic_box').appendChild(s_b);

        document.getElementById('stat_tab').click();
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
        // pv = view;
        // pm = model;
    }

    setQuestions() {
        //Startfunktion um erstmal alles mit Daten zu füttern
        // this.pm.getQuestions();

        this.pv.vfrage = this.pm.frage;

    }

    getQuestionsP() {
        //return this.pm.getQuestionsM();
        this.pm.getQuestions();
    }

    dataChoice(value) {
        console.log('value is: ', value);

        if (value === 'own') {
            this.pm.createFile();
        }

        if (value === 'json') {
            this.pm.getJSON();
        }
    }

    saveQuestion() {

        for (let i = 0; i < q_radio.length; i++) {
            if (q_radio[i].checked) {
                q_type = q_radio[i].value;
                console.log('Checkvalue: ', q_type);
            }
        }


        let newdata = [(this.pv.vfrage.length + 1), q_text.value, q_ansa.value, q_ansb.value, q_ansc.value, q_ansd.value, q_type];
        //take data from inputs

        this.pv.clear('inputs');

        //this.pm.saveQuestionM(newdata);
        this.updateQuestions(newdata);


    }

    updateQuestions(data) {
        //this.pv.vfrage.push(data);

        this.pv.update(data);
        // let container = document.getElementById('exam_box');
        // let e_div = document.createElement('div');
        // e_div.setAttribute('class', 'ex_qu');
        // e_text = document.createElement('textarea');
        // e_text.setAttribute('class', 'e_text');
        // e_ansa = document.createElement('button');
        // e_ansa.setAttribute('class', 'e_ansa');
        // e_ansb = document.createElement('button');
        // e_ansb.setAttribute('class', 'e_ansb');
        // e_ansc = document.createElement('button');
        // e_ansc.setAttribute('class', 'e_ansc');
        // e_ansd = document.createElement('button');
        // e_ansd.setAttribute('class', 'e_ansd');
        //
        //
        // e_text.value = data[1];
        // e_ansa.textContent = data[2];
        // e_ansb.textContent = data[3];
        // e_ansc.textContent = data[4];
        // e_ansd.textContent = data[5];
        //
        // e_div.appendChild(e_text);
        // e_div.appendChild(e_ansa);
        // e_div.appendChild(e_ansb);
        // e_div.appendChild(e_ansc);
        // e_div.appendChild(e_ansd);
        //
        // container.appendChild(e_div);

        console.log('new array: ', this.pv.vfrage);
    }


    checkQuestion(array, answer) {
        //this.pm.checkQuestion(answer);

        console.log('array to check: ', array);
        console.log('answer to check: ', answer);

        if (array) {
            if (answer === array[1]) {
                window.alert('Whee! Correct!');
                rights = rights + 1;
            } else {
                window.alert('Wrong...sorry.');
                wrongs = wrongs + 1;
            }

        } else {
            window.alert('Please answer.');
        }

    }


    // ****~~~****~~~****~~~Statistik-Zeug~~~****~~~****~~~****

    startStatistic() {
        window.alert('Statistik ooooooh');
    }
}
