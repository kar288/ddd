import csv

with open('order.csv', 'rb') as order:
    reader = csv.reader(order, delimiter=',', quotechar='|')
    for i, row in enumerate(reader):
        print str(i)
        for case in row:
            with open('tlx-' + case + '.csv', 'rb') as tlx:
                lines = [line.rstrip() for line in tlx]
                print case, lines[i]
