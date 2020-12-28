# Tracking Covid-19 data with interactive maps and charts in Angular 9 using D3

![GitHub Preview](/images/info.jpg)

Click [here](https://interactive-analytics.org/covid-map-DE/) to view the demo app.

## Main Dependencies

- Angular 9.1.7

- D3 5.16.0


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.7.

## To initialize

Clone the repository on your local system:
git clone https://github.com/MarcelRuoff-KIT/Conversational-COVID-19-Dashboard.git

Go to the corresponding folder (.../Conversational-COVID-19-Dashboard) and install all relevant packages:
npm install

!Don't run npm audit fix!


## To serve
Run the following to prevent memory errors
node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng serve  

## To deploy
node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng build --base-href /covid-map-DE/ --prod --optimization
