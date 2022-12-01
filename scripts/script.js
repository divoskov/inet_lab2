import linearEquation from "./linearEquation.js";
/**
 * Создание и добавление на страницу input'ы для координат точек
 */
function add_dots() {
    // Парсим количество точек
    let number = document.getElementById("dots_number").value;
    let container = document.getElementById("dots");

    // Удаляем предыдущие input'ы для точек, если есть
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    // Создаем надпись для строки с координатами x и присоединяем ее к первой точке
    let x_label = document.createElement("label");
    x_label.innerHTML = "x";

    let x_inp = document.createElement("input");
    x_inp.id = "x0";
    x_inp.type = "number";

    container.appendChild(x_label);
    container.appendChild(x_inp);
    x_label.setAttribute("for", "x_inp");

    // Добавляем поля для ввода x по введенному n
    for (let i = 1; i < number; i++) {
        x_inp = document.createElement("input");
        x_inp.id = "x" + i;
        x_inp.type = "number";

        container.appendChild(x_inp);
    }

    container.appendChild(document.createElement("br"));

    // То же самое для y
    let y_label = document.createElement("label");
    y_label.innerHTML = "y";

    let y_inp = document.createElement("input");
    y_inp.id = "y0";
    y_inp.type = "number";

    container.appendChild(y_label);
    container.appendChild(y_inp);
    y_label.setAttribute("for", "y_inp");

    for (let i = 1; i < number; i++) {
        y_inp = document.createElement("input");
        y_inp.id = "y" + i;
        y_inp.type = "number";

        container.appendChild(y_inp);
    }

    document.getElementById("step").style.marginTop = 0;
}


// Парсинг координат, вычисление сплайна, вывод координатной прямой и визуализация сплайнов
function start() {
    let number = Number(document.getElementById("dots_number").value);

    let x = []
    let y = []
    for (let i = 0; i < number; i++) {
        x.push(Number(document.getElementById("x" + i).value));
        y.push(Number(document.getElementById("y" + i).value));
    }

    // Расчет коэффициентов сплайнов
    let h = Number(document.getElementById("step_input").value);
    let dots = get_dots(get_spline(x, y), h, x);

    let config = {
        margin: {t: 0},
        displayMoBar: false,
        responsive: true,
        width: 1300,
        height: 600
    }

    let TESTER = document.getElementById('tester');
    Plotly.plot(TESTER, [{x: dots[0],
                        y: dots[1],}],
                        config)

}


function clear_last() {
    Plotly.deleteTraces(document.getElementById('tester'), 0);
}


function clear_all() {
    for (let i = 0; i < length; i++)
        Plotly.deleteTraces(document.getElementById('tester').data.length, 0);
}


// Вычисление коэффициентов локальных сплайнов по табличной функции
function get_spline(x, y) {
    // Число строк/столбцов матрицы
    let n = x.length;

    // Массивы коэффициентов сплайна
    let a = []
    for (let i = 0; i < n - 1; i++)
        a.push(y[i]);
    let b = [];
    let c = [0];
    let d = [];

    // Квадратная матрица коэффициентов для вычисления массивов коэффициентов сплайна
    // Матрица имеет вид
    // _______________________________________________________ _
    // |_b0__|_d0__|_b1__|_c1__|_d1__|_..._|_bn-1|_cn-1|_dn-1| |
    // |x1-x0|x1-x0|__0__|__0__|__0__|_..._|__0__|__0__|__0__| |
    // |__0__|__0__|x2-x1|_..._|_..._|_..._|__0__|__0__|__0__| > 3n - 4
    // |_________________________..._________________________| |
    // |__0__|__0__|__0__|__0__|__0__|_..._|xn-xn1|_...|_..._| |
    // |_________________________..._________________________| _
    let matrix = [];
    let m_length = 3 * n - 4;

    // Из равенства табличным значениям значений сплайна на границах - n-1 уравнение
    
    // Первое уравнение специального вида
    let line = [x[1] - x[0], x[1] - x[0]];
    for (let i = 2; i < m_length; i++)
        line.push(0);
    matrix.push(line);
    
    // Следующие n - 2 имеют общий вид
    for (let i = 0; i < n-2; i++) {
        line = [];
        // Добавление нулей слева
        for (let j = 0; j < 3*i + 2; j++)
            line.push(0);
        // Коэффициенты
        let base = x[i+2] - x[i+1];
        line.push(base, Math.pow(base, 2), Math.pow(base, 3));
        // Добавление нулей справа
        for (let j = 3*i + 5; j < m_length; j++)
            line.push(0);
        matrix.push(line);
    }

    // Из равенства первой производной на месте стыков - n-2 уравнения

    // Первое уравнение специального вида
    line = [1, 3 * Math.pow(x[1] - x[0], 2), -1];
    for (let i = 3; i < m_length; i++)
        line.push(0);
    matrix.push(line);

    // Остальные n-3 имеют общий вид
    for (let i = 0; i < n-3; i++) {
        line = []
        // Добавление нулей слева
        for (let j = 0; j < 4*i + 2; j++)
            line.push(0);
        // Коэффициенты
        line.push(1, 2 * (x[i+2]-x[i+1]), 3 * Math.pow(x[i+2]-x[i+1], 2), -1);
        // Добавление нулей справа
        for (let j = 4*i + 6; j < m_length; j++)
            line.push(0);
        matrix.push(line);
    }

    // Из равенства второй производной на месте стыков - n - 2 уравнения

    // Первое уравнения специального вида
    line = [0, 6 * (x[1] - x[0]), 0, -2];
    for (let i = 4; i < m_length; i++)
        line.push(0);
    matrix.push(line);

    // Остальные n-3 имеют общий вид
    for (let i = 0; i < n-3; i++) {
        line = []
        // Добавление нулей слева
        for (let j = 0; j < 4*i + 3; j++)
            line.push(0);
        // Коэффициенты
        line.push(2, 6 * (x[i+2] - x[i+1]), 0, -2);
        // Добавление нулей справа
        for (let j = 4*i + 7; j < m_length; j++)
            line.push(0);
        matrix.push(line);
    }

    // Из условия, что сплайн естественный

    line = []
    for (let i = 0; i < m_length - 2; i++)
        line.push(0);
    line.push(1, 3 * (x.at(-1) - x.at(-2)));
    matrix.push(line);

    // Вектор правых частей уравнений
    let right = [];
    for (let i = 0; i < n-1; i++)
        right.push(y[i+1] - y[i]);
    for (let i = n-1; i < 3*n-4; i++)
        right.push(0);

    // Решение СЛАУ
    let solution = linearEquation.solve(matrix, right);

    // Формируем массивы коэффициентов
    b.push(solution[0]);
    d.push(solution[1]);
    let i = 2;
    while (i < solution.length) {
        b.push(solution[i++]);
        c.push(solution[i++]);
        d.push(solution[i++]);
    }

    let splines = [];
    for (let i = 0; i < a.length; i++) {
        splines.push([a[i], b[i], c[i], d[i], x[i]]);
    }

    return splines;
}


function f3(x, a, b, c, d, x0) {
    return a + b * (x - x0) + c * Math.pow(x - x0, 2) + d * Math.pow(x - x0, 3);
}


function get_dots(splines, step, x) {
    let dot_x = [];
    let dot_y = [];
    for (let k = 0; k < splines.length; k++) {
        let xi = splines[k][4];
        while (xi < x[k+1]) {
            dot_x.push(xi);
            dot_y.push(f3(xi, splines[k][0], splines[k][1], splines[k][2], splines[k][3], splines[k][4]));
            xi += step;
        }
    }

    return [dot_x, dot_y];
}

window.add_dots = add_dots;
window.start = start;
window.clear_last = clear_last;