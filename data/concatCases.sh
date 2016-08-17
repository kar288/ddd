for i in {1..20};
do
  # echo $i;
  dir=./data-$i/logs-$i
  ls $dir;
  for c in 'A' 'B' 'C'
  do
    # echo $c
    find -wholename "$dir/*-$c.txt" ! -wholename "$dir/*sample*" ! -wholename "$dir/*test*" -exec cat {} \; | sort -un > $dir/$c.txt
  done
done;
