#!/bin/bash

# for i in $(seq $1 $2);
# do
#   dir=data-$i/logs-$i
#   for c in 'A' 'B' 'C'
#   do
#     activate=$(grep "sub-instrument\tstart" $dir/$c.txt | wc -l)
#     deactivate=$(grep "sub-instrument\tstop" $dir/$c.txt | wc -l)
#     printf "%s\t%s\t%s\n" $i $c $[$activate-$deactivate]
#     grep "sub-instrument\ts" $dir/$c.txt
#     # printf "%s\t%s\t%s\n" $c $activate $deactivate
#   done
# done;

#!/bin/bash

for i in $(seq $1 $2);
do
  dir=data-$i/logs-$i
  for c in 'A' 'B' 'C'
  do
    movedMover=$(grep "moved\tmover" $dir/$c.txt | wc -l)
    # deactivate=$(grep "sub-instrument\tstop" $dir/$c.txt | wc -l)
    printf "%s\t%s\t%s\n" $i $c $[movedMover]
    # grep "sub-instrument\ts" $dir/$c.txt
    # printf "%s\t%s\t%s\n" $c $activate $deactivate
  done
done;
