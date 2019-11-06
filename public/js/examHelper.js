// const sqlite3 = require('sqlite3');
// require('stream');

let p, v, m;

document.addEventListener('DOMContentLoaded', function () {
    //let db = new sqlite3.Database(':memory:');
    m = new examModel();
    p = new examPresenter();
    v = new examView(p);
    p.setModelAndView(m, v);
    p.setQuestions();


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
    getQuestionsM() {
        return [...this.frage];
        //returns copy of frage array
        //right now this is the same as updateQuestions,
        // final version here will include database work tho

    }

    saveQuestionM(data){
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


    }

    getQuestionsV() {
       this.vfrage = this.vp.getQuestionsP();
       console.log('This is the View and this is my array: ', this.vfrage);
    }

    saveQuestionV() {
        let q_text = document.getElementById('q_text').value;
        let q_ansa = document.getElementById('q_ansA').value;
        let q_ansb = document.getElementById('q_ansB').value;
        let q_ansc = document.getElementById('q_ansC').value;
        let q_ansd = document.getElementById('q_ansD').value;
        let text = document.getElementById('text');
        let math = document.getElementById('math');
        let sheet = document.getElementById('sheet');
        let q_type;

        if (q_text === "" || q_ansa === "" || q_ansb === "" || q_ansc === "" || q_ansd === "") {
            window.alert('Alles ausfüllen.');
            return;
        }

        if (text.checked) {
            q_type = text.value;
        }
        if (math.checked) {
            q_type = math.value;
        }
        if (sheet.checked) {
            q_type = sheet.value;
        }

        //console.log('Selected: ', q_type);

        //this.vfrage.push([q_text, q_ansa, q_ansb, q_ansc, q_ansd, q_type]);
        //funktioniert

        let newdata = [q_text, q_ansa, q_ansb, q_ansc, q_ansd, q_type];
        this.vp.saveQuestionP(newdata);

        this.appendQ(newdata);


            }

    appendQ(stuff){

        let ex_div = document.createElement('div');
        ex_div.setAttribute('class', 'ex_qu');
        let textnode = document.createTextNode(stuff[0]);
        ex_div.appendChild(textnode);
        document.getElementById('exam').appendChild(ex_div);

    }
    updateQuestionsV(data){
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

    checkQuestion(answer) {

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

    setQuestions(){
        //Startfunktion um erstmal alles mit Daten zu füttern
        this.pv.getQuestionsV();
    }

    getQuestionsP() {
        return this.pm.getQuestionsM();
    }

    saveQuestionP(data){
        this.pm.saveQuestionM(data);
        this.updateQuestionsP();
    }

    updateQuestionsP(){
        this.pv.updateQuestionsV(this.pm.updateQuestionsM());
    }


    checkQuestion(answer) {
        this.pm.checkQuestion(answer);
    }
}
