from flask import Flask
from flask import render_template
import datetime
import json
import csv
app = Flask(__name__)

@app.route("/")
def hello():
    data = {}
    for i in range(1, 21):
        print(i)
        directory = 'data-' + str(i) + '/logs-' + str(i) + '/'
        cases = {}
        for c in ['A', 'B', 'C']:
            with open(directory + c + '.txt', 'r') as f:
                instrumentSwitch = {}
                first = 0
                prev = 0
                for line in f.readlines():
                    if 'sub-instrument\ts' in line:
                        parts = line.split('\t')
                        time = int(parts[0][0:-2])
                        if first == 0:
                            first = time
                        time = (time - first) / 1000
                        if prev == 0:
                            prev = time
                        else:
                            prev = time
                        instrumentSwitch[time] = {parts[3] : parts[2]}
                cases[c] = instrumentSwitch
        data[i] = cases
    return json.dumps(data)

instruments = [
    'moved',
    'draw',
    'colorPicker',
    'clipboard',
    'resizer',
    'shape',
    'pasted',
    'copied',
    'cut',
    'deleted',
    # 'changed color',
    'changed size',
    'shape continued'
];

converter = {
    'moved': 'mover',
    'draw': 'draw',
    'resizer': 'resizer',
    'shape': 'shapes',
    'pasted': 'clipboard',
    'copied': 'clipboard',
    'cut': 'clipboard',
    'deleted': 'clipboard',
    'colorPicker': 'colorPicker',
    'changed size': 'resizer',
    'shape continued': 'shapes'
}

@app.route("/allActions")
def allActions():
    data = {}
    for i in range(1, 21):
        print(i)
        directory = 'data-' + str(i) + '/logs-' + str(i) + '/'
        cases = {}
        for c in ['A', 'B', 'C']:
            with open(directory + c + '.txt', 'r') as f:
                instrumentSwitch = {}
                first = 0
                prev = 0
                startTime = 0
                instrument = ''
                for line in f.readlines():
                    parts = line.split('\t')
                    time = int(parts[0][0:-3])
                    if len(parts) < 2:
                        continue

                    currentInstrument = parts[1]
                    if 'sub-instrument\t#' in line:
                        currentInstrument = 'colorPicker'
                        if i == 2:
                            print(i, c, line)
                    if not currentInstrument in instruments:
                        continue

                    if first == 0:
                        first = time
                    time = (time - first)

                    currentInstrument = converter[currentInstrument]
                    instrumentSwitch[time] = currentInstrument
                cases[c] = instrumentSwitch
        data[i] = cases
    return json.dumps(data)

dimensions = ['Attractiveness','Perspicuity','Efficiency','Dependability','Stimulation','Novelty']
pairedOrders = [
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'A'],
]

@app.route("/ueqOrder")
def ueqOrder():
    data = {}
    cases = ['A', 'B', 'C']
    BbetterThanC = {}
    AbetterThanB = {}
    AbetterThanC = {}
    betterThan = {'ab': {}, 'ac': {}, 'bc': {}}
    with open('ueq-a.csv', 'r') as fa, open('ueq-b.csv', 'r') as fb, open('ueq-c.csv', 'r') as fc, open('order.csv', 'rt') as order:
        lines = {}
        lines['A'] = fa.readlines()
        lines['B'] = fb.readlines()
        lines['C'] = fc.readlines()
        order = order.readlines()
        order = [line.split() for line in order]
        for i in range(20):
            for case in betterThan:
                betterThan[case][i] = []
            print(i + 1, order[i], '\t\t\t', 'A > B', '\t', 'A > C', '\t', 'B > C')
            for j, dimension in enumerate(dimensions):
                vals = {}
                caseOrder = cases
                for case in cases:
                    parts = lines[case][i].strip().split(',')
                    vals[case] = float(parts[j])
                    print(case + '\t\t\t' + parts[j])
                cases.sort(key=vals.__getitem__)
                print(dimension, cases, '\t', cases.index('A') > cases.index('B'), '\t', cases.index('A') > cases.index('B'), '\t', cases.index('B') > cases.index('C'))
                betterThan['bc'][i].append(cases.index('B') > cases.index('C'))
                betterThan['ab'][i].append(cases.index('A') > cases.index('B'))
                betterThan['ac'][i].append(cases.index('A') > cases.index('C'))

        print('\t' + '\t'.join(dimensions))
        for case in betterThan:
            print(case)
            for i in betterThan[case]:
                string = str(i + 1) + '\t'
                count = 0
                for dimension in betterThan[case][i]:
                    string += str(dimension) + '\t\t'
                    if dimension:
                        count += 1
                print(string + str(count))
    return json.dumps(betterThan)

@app.route("/colorAndResizeSample")
def colorAndResizeSample():
    data = {}
    for i in range(1, 21):
        print(i)
        directory = 'data-' + str(i) + '/logs-' + str(i) + '/'
        cases = {}
        for c in ['A', 'B', 'C']:
            with open(directory + c + '.txt', 'r') as f:
                actions = {}
                for line in f.readlines():
                    if 'action\tresizer\tsample' in line:
                        if not 'resizer' in actions:
                            actions['resizer'] = 0
                        actions['resizer'] += 1
                    if 'action\tcolorPicker\tsample' in line or ('sub-instrument\t#' in line and c == 'A'):
                        if not 'colorPicker' in actions:
                            actions['colorPicker'] = 0
                        actions['colorPicker'] += 1
                cases[c] = actions
        data[i] = cases
    return json.dumps(data)

@app.route("/stats")
def stats():
    data = {}
    for i in range(1, 21):
        print(i)
        directory = 'data-' + str(i) + '/logs-' + str(i) + '/'
        cases = {}
        for c in ['A', 'B', 'C']:
            with open(directory + c + '.txt', 'r') as f:
                lines = f.readlines()
                start = int(lines[0].split()[0][:-1])
                end = int(lines[-1].split()[0][:-1])
                endTime = datetime.datetime.fromtimestamp(end/1000.0)
                startTime = datetime.datetime.fromtimestamp(start/1000.0)

                prevTime = start
                for line in lines:
                    t = int(line.split()[0][:-1])
                    tTime = datetime.datetime.fromtimestamp(t/1000.0)
                    if t - prevTime > 1000 * 60 * 2:
                        print(str(tTime.hour) + ':' + str(tTime.minute), prevTime, line)
                    prevTime = t
                diff = int((end - start) / 1000)
                cases[c] = int(diff / 60)
                seconds = diff - cases[c] * 60
                print(c, str(startTime.hour) + ':' + str(startTime.minute), str(endTime.hour) + ':' + str(endTime.minute), str(cases[c]) + ':' + str(seconds))
        data[i] = cases
    return json.dumps(data)


@app.route("/participantOrder")
def participantOrder():
    data = {}
    with open('order.csv', 'rt') as order:
        reader = csv.reader(order, delimiter=',', quotechar='|')
        for i, row in enumerate(reader):
            print(row)
            data[i + 1] = row
    return json.dumps(data)

@app.route('/visualize')
def visualize():
    return render_template('./visualize.html')

@app.route('/visualizeActions')
def visualizeActions():
    return render_template('./visualizeActions.html')

@app.route('/visualizeActionsInOrder')
def visualizeActionsInOrder():
    return render_template('./visualizeActionsInOrder.html')

@app.route('/actionCounts')
def actionCounts():
    return render_template('./actionCounts.html')

@app.route('/colorAndResizeSampleView')
def colorAndResizeSampleView():
    return render_template('./colorAndResizeSampleView.html')

@app.route('/ueqOrderView')
def ueqOrderView():
    return render_template('./ueqOrderView.html')


@app.route('/switchesView')
def switchesView():
    return render_template('./switchesView.html')

@app.route('/parallelCoordinates')
def parallelCoordinates():
    return render_template('./parallelCoordinates.html')



if __name__ == "__main__":
    app.run()
