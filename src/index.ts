import * as express from 'express';
import { Application } from 'express';
import * as mqtt from 'async-mqtt';
import { format, getHours } from 'date-fns';
import { forkJoin, fromEvent } from 'rxjs';
import { filter, map, mergeMap, tap, throttleTime } from 'rxjs/operators';

const app: Application = express();
const port = 9052;

const mqttClient = mqtt.connect('http://192.168.178.28:1883', { clientId: process.env.npm_package_name });
// const mqttClient = mqtt.connect('http://broker.emqx.io', { clientId: process.env.npm_package_name }); // testing
mqttClient.subscribe('ESP_7888034/movement');

function ofTopicEquals(topicName: string) {
    return filter(([topic, message]) => topic === topicName);
}

function log(logMessage: string) {
    console.log(`${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}: ${logMessage}`);
}

const messages$ = fromEvent(mqttClient, 'message').pipe(
    map(([topic, message]) => [topic, message.toString()]),
    tap(([topic, message]) => log(`Received MQTT message with topic=${topic}, message=${message}`))
);

// movements
messages$.pipe(
    ofTopicEquals('ESP_7888034/movement'),
    tap(_ => log('Detected topic...')),
    filter(([topic, message]) => getHours(new Date()) >= 23 || getHours(new Date()) <= 8), // only trigger between 23:00 and 08:59
    tap(_ => log('Passed hour check...')),
    throttleTime(1000 * 60 * 5), // throttle for 5 min
    tap(_ => log('Passed throttle check...')),
    mergeMap(([topic, message]) => forkJoin([
        mqttClient.publish('alexa/in/automation', 'Kleines Licht'),
        mqttClient.publish('relais/status', 'on')
    ])),
    tap(publishedTopics => log(`Published MQTT ${publishedTopics.length} messages...`))
).subscribe(result => log(`Result: [${result}]`));

mqttClient.on('connect', () => {
    log(`connected with MQTT broker`);

    app.listen(port, () => {
        log(`running at http://localhost:${port}`);
    });
});
