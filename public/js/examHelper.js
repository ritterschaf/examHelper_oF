// require('stream');


let p, v, m;
let q_text, q_ansa, q_ansb, q_ansc, q_ansd, text, math, sheet, q_type;

document.addEventListener('DOMContentLoaded', function () {
    //let db = new sqlite3.Database(':memory:');
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
        // this.frage = {
        //     text: [
        //         {"q": "Was bedeutet bird?", "l": ["Vogel", "Wurm", "Baum", "Bürde"]}
        //     ],
        //     math: [
        //         {"q": "x^2+x^2", "l": ["2x^2", "x^4", "x^8", "2x^4"]}
        //     ],
        //     sheet: [
        //         {"q": "C4", "l": ["C", "D", "F", "G"]}
        //     ]
        // };

        // ^ this is javascript object. Can't be copied! Or at least not without major hassle

        this.frage = [
            ["Bird?", "Vogel", "Wurm", "Baum", "Bürde", "text"],
            ["x^2+x^2", "2x^2", "x^4", "x^8", "2x^4", "math"],
            ["C4", "C", "D", "F", "G", "sheet"]
        ];
    }

    getQuestions() {
        //return [...this.frage];
        //returns copy of frage array
        //right now this is the same as updateQuestions,
        // final version here will include database work tho

        //db work here...
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

    setHandler() {

        //Input-Handler

        q_text = document.getElementById('q_text');
        q_ansa = document.getElementById('q_ansA');
        q_ansb = document.getElementById('q_ansB');
        q_ansc = document.getElementById('q_ansC');
        q_ansd = document.getElementById('q_ansD');
        text = document.getElementById('text');
        math = document.getElementById('math');
        sheet = document.getElementById('sheet');


        //Button-Handler

        //registrier hier Buttondruck vom Save-Button und leite weiter an Presenters SaveQuestion.
        document.getElementById("save_button").addEventListener("click", function () {
            v.vp.saveQuestion();
        });

        //registrier Buttondruck von Statistik-Button, sofort umschalten auf Statistik Tab...joa.
        document.getElementById('statistic_button').addEventListener("click", function () {
            v.vp.startStatistic();
        });


    }

    clearInputs() {

        q_text.value = q_ansa.value = q_ansb.value = q_ansc.value = q_ansd.value = "";
    }

    generateQuestions() {

    }

    appendQ(stuff) {

        let ex_div = document.createElement('div');
        ex_div.setAttribute('class', 'ex_qu');
        let textnode = document.createTextNode(stuff[0]);
        ex_div.appendChild(textnode);
        document.getElementById('exam').appendChild(ex_div);

    }

    updateQuestionsV(data) {
        this.vfrage = data;
        console.log('View was updated: ', this.vfrage);
    }


    renderSheet(note) {
        const VF = Vex.Flow;

        // Create an SVG renderer and attach it to the DIV element named "boo".
        // const div = document.getElementById(name);
        const div = document.getElementById('boo');
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

    renderMath() {

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

        // this.pv.vfrage = this.pm.frage;

    }

    getQuestionsP() {
        //return this.pm.getQuestionsM();
    }

    saveQuestion() {

        if (text.checked) {
            q_type = text.value;
        }
        if (math.checked) {
            q_type = math.value;
        }
        if (sheet.checked) {
            q_type = sheet.value;
        }

        let newdata = [q_text.value, q_ansa.value, q_ansb.value, q_ansc.value, q_ansd.value, q_type.value];
        //take data from inputs

        this.pv.appendQ(newdata);
        this.pv.clearInputs();

        //this.pm.saveQuestionM(newdata);
        //this.updateQuestions(newdata);


    }

    updateQuestions(data) {
        this.pv.vfrage.push(data);

    }


    checkQuestion(answer) {
        this.pm.checkQuestion(answer);
    }


    // ****~~~****~~~****~~~Statistik-Zeug~~~****~~~****~~~****

    startStatistic() {
        window.alert('Statistik ooooooh');
    }
}
