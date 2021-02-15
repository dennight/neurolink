// Определение переменной препроцессора
let preprocessor = 'sass';

// Отпределение константы gulp
const {src, dest, parallel, series, watch} = require('gulp');

// Подключение BrowserSync (обновляет страницу во время разработки)
const browserSync = require('browser-sync').create();

// Подключение gulp-concat (собирает несколько файлов одного типа в один)
const concat = require('gulp-concat');

// Подключение gulp-uglify-es (минимизирует код javascript)
const uglify = require('gulp-uglify-es').default;

// Подключение модули gulp-dart-sass (препроцессор sass)
const sass = require('gulp-dart-sass');

// Подключение Autoprefixer (делает стили кроссбраузерными для старых браузеров)
const autoprefixer = require('gulp-autoprefixer');

// Подключение модуля gulp-clean-css (улучшает код css)
const cleancss = require('gulp-clean-css');

// Подключение gulp-imagemin для работы с изображениями (оптимизирует изображения)
const imagemin = require('gulp-imagemin');

// Подключение модуля gulp-newer (запускает задачи только для изменившихся файлов)
const newer = require('gulp-newer');

// Подключения модуля del (очищает папки от ненужных файлов)
const del = require('del');

// Определяем логики работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указание папку сервера
		notify: false, // Отключение уведомления
		online: true // Режим работы: true или false
	})
}

function scripts() {
	return src([ // Берём файлы из источников
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('app.min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
	return src('app/' + preprocessor + '/main.' + preprocessor + '') // Выбираем источник: "app/sass/main.sass"
	.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
	.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.css
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
	return src('app/images/src/**/*') // Берём все изображения из папки источника
	.pipe(newer('app/images/dest/')) // Проверяем, было ли изменено (сжато) изображение ранее
	.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
	.pipe(dest('app/images/dest/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/fonts/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return del('dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function startwatch() {
 
	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	
	// Мониторим файлы препроцессора на изменения
	watch('app/**/' + preprocessor + '/**/*', styles);
 
	// Мониторим файлы HTML на изменения
	watch('app/**/*.html').on('change', browserSync.reload);
 
	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/images/src/**/*', images);
 
}
// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;
 
// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;
 
// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, images, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, startwatch);