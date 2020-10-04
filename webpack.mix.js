let mix = require('laravel-mix')
let tailwindcss = require('tailwindcss')

mix.js('src/js/app.js', 'js')
    .postCss('src/css/app.css', 'css', [
    	require('tailwindcss')('tailwind.config.js'),
    ])
