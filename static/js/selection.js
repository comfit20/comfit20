var number_of_workouts = 0;
$(document).ready(function () {
    //Create time for the datetimepicker to set -> now plus 2 minutes

    var now_in_2 = new Date(getDateIn2Minutes());

    $('#datetimepicker1').datetimepicker({
        // format: 'YYYY/MM/DD'
        debug: false,
        icons: {
            time: 'far fa-clock',
            date: 'far fa-calendar-alt',
            up: 'fas fa-arrow-up',
            down: 'fas fa-arrow-down',
            previous: 'fas fa-chevron-left',
            next: 'fas fa-chevron-right',
            today: 'far fa-calendar-check',
            clear: 'far fa-trash-alt',
            close: 'fas fa-times'
        },defaultDate: now_in_2,minDate: now_in_2
    });



    fetch('./static/data/ExerciseList.json')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            number_of_workouts = data['exercises'].length
            //Make data global available
            window.data = data

            parseExercisesToForm(data);
        });
});

function generateRandomWorkout(number) {
    // Uncheck all in case some where selected already
    for (i = 0; i < number_of_workouts; i++) {
        $("#exercise-" + i).attr("checked", false);
        // console.log("uncheck all", i)
    }



    //
    var number_of_random_workouts = number;
    var total_exercises = number_of_workouts;
    var chosenRandomExer = [];


    while(chosenRandomExer.length < number_of_random_workouts){
        var r = Math.floor(Math.random() * total_exercises)+1;
        if(chosenRandomExer.indexOf(r) === -1) chosenRandomExer.push(r);
    }

    for (i = 0; i < number_of_random_workouts; i++) {

        $("#exercise-" + chosenRandomExer[i]).attr("checked", true);

    }

}

function parseExercisesToForm(data) {

    // Filter for categories
    const belly_list = data['exercises'].filter(excercise => excercise.category.includes("belly"));
    const legs_list = data['exercises'].filter(excercise => excercise.category.includes("legs"));
    const core_list = data['exercises'].filter(excercise => excercise.category.includes("core"));
    const arms_list = data['exercises'].filter(excercise => excercise.category.includes("arms"));

    categorys = [core_list,legs_list,belly_list,arms_list]
    $.each(categorys,function (index, category) {
        var wrapper = $("<div class='form-row'></div>")
        $('<h2 class="col-sm-12">'+category[0].category[0]+'</h2>').appendTo(wrapper);
        $.each(category, function (index, elem) {
            $('<div class="col-md-4 mb-3 input-check-exercise"' +
                '>' +
                '<div class="form-check">' +
                ' <input type="checkbox" class="form-check-input" name="' + elem.id + '" id="exercise-' + elem.id + '">' +
                '   <label class="form-check-label" for=excercise-' + elem.id + '>' + elem.name + '</br></label>' +
                '</div></div>').appendTo(wrapper);
        });
        wrapper.appendTo("#excercises-boxes");
    });
}
function getDateIn2Minutes() {
    var now = dayjs()
    var now_plus_2 = now.add(2,'minute');
    return now_plus_2;
}

function submitcheck(element) {
    var selected_rounds = element[0].options[element[0].selectedIndex].value;
    var duration_wo = element[1].value;
    var duration_rest = element[2].value;
    var selected_date = element[3].value;
    console.log(selected_date)
    var selected_elements = $(element).serializeArray();
    console.log(selected_elements)
    exercise_id_list = [];
    $.each(selected_elements, function (index, element) {
        exercise_id_list.push(element.name)
    });

    // Generate HTML List from exercise list for summary
    var table_container = document.createElement('div')
    ul = document.createElement('div')
    ul.classList.add("row");
    ul.classList.add("m-3");
    var name_for_id = window.data.exercises;
    var cat_list = []
    exercise_id_list.forEach(function (item) {
        var excercise_obj = name_for_id.filter(obj => {
            return obj.id === parseInt(item)
        })[0]
        cat_list.push(excercise_obj.category)

        let li = document.createElement('div');
        //li.classList.add('list-group-item')
        li.classList.add('col-md-4')
        li.classList.add('border')
        li.classList.add('d-flex')
        li.classList.add('p-3')
        li.classList.add('justify-content-center')
        li.style.backgroundColor = "#555"
        ul.appendChild(li);
        li.innerHTML += excercise_obj.name;
    });
    table_container.append(ul)


    $('.modal-body').empty();
    $('.modal-body').append("<h5>Summary</h5>");
    $('.modal-body').append(table_container);

    var counts = {}
    cat_list.forEach((el) => {
        counts[el] = counts[el] ? (counts[el] += 1) : 1;
    });
    console.log(counts)

    for (const [key, value] of Object.entries(counts)) {
        let div = document.createElement('div');
        div.classList.add("btn")
        div.classList.add("btn-primary")
        div.classList.add("m-2")
        div.classList.add("disabled")
        div.innerHTML = key
        let span = document.createElement('span');
        span.classList.add("badge")
        span.classList.add("badge-light")
        span.classList.add("ml-2")
        span.innerHTML = value
        div.append(span)
        $('.modal-body').append(div)
        console.log(`${key}: ${value}`);
    }





    //create object for the url
    var url_builder_obj = {}
    url_builder_obj["excercises"] = JSON.stringify(exercise_id_list)
    var selected = dayjs(selected_date.toString())
    // Check if selected date is over. If so, take now and add 2 minutes for starting time
    if(selected.isBefore(dayjs())){
        console.log("add 2 minures")
        selected_date = getDateIn2Minutes().toLocaleString()
    }
    url_builder_obj["timestamp"] = selected_date
    url_builder_obj["wo_duration"] = duration_wo
    url_builder_obj["rest_duration"] = duration_rest
    url_builder_obj["wo_rounds"] = selected_rounds

    createModal(url_builder_obj);
    return false;
}

function createModal
(url_object) {
    //Create url from object
    var url_parameters = $.param(url_object);

    //Show modal
    $('.modal').modal();

    //Add link to created workout to button and clipboard
    $('#btn-go-to-workout').attr("href", "workout.html?"+url_parameters);
    var clipboard = new ClipboardJS('.clipboard-button');
    document.getElementById('next-0-link').value = window.location.hostname+"/workout.html?"+url_parameters;

}

function uncheckForCancel(){
    // console.log("cancel",number_of_workouts)
    for (i = 1; i <= number_of_workouts; i++) {
        // console.log($("#exercise-" + i))
        $("#exercise-" + i).attr("checked", false);
    }
}

