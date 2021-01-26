#/bin/bash
if [ -z "$1" ]; then
    echo "ERROR: Provide a rules profile name from rules.js"
    echo
    echo "Usage: analyze.sh RULES-PROFILE-NAME"
    exit 1
fi

PROFILE=$1
SOLUTIONS=data/${PROFILE}-solutions.txt

COUNT=data/${PROFILE}-count.txt
COUNTSORTED=data/${PROFILE}-count-sorted.txt
SOLUTIONS10=data/${PROFILE}-solutions-10.txt
SOLUTIONSNOTFOUND=data/${PROFILE}-solutions-notfound.txt
SOLUTIONSFOUND=data/${PROFILE}-solutions-found.txt

> ${COUNT}
> ${COUNTSORTED}
> ${SOLUTIONS10}

DIR1=data/${PROFILE}1
DIR2=data/${PROFILE}2

mkdir -p $DIR1
mkdir -p $DIR2


for NUMBER in {0..1000}; do
    if [ "${NUMBER}" -lt 10 ]; then
        NUMBER=00${NUMBER}
    elif [ ${NUMBER} -lt 100 ]; then
        NUMBER=0${NUMBER}
    fi

    NUM=${NUMBER}.txt

    echo "Creating ${DIR1}/${NUM}"
    grep "${NUMBER}:" ${SOLUTIONS} > $DIR1/${NUM}

    echo "Sorting ${DIR1}/${NUM} ${DIR2}/${NUM}"
    cat ${DIR1}/${NUM} | awk '{ print length,$0 }' | sort -n | uniq | awk '{ $1=""; print $0 }' | cut -f2- -d' ' > ${DIR2}/${NUM}

    echo "Adding solution count for ${NUMBER} to ${COUNT}"
    echo "${NUMBER}: `wc -l ${DIR1}/${NUM} | awk '{ print $1 }'`" >> ${COUNT}

    echo "Adding ${NUMBER}'s shortest 10 and longest 10 solutions to solutions.txt"
    head ${DIR2}/${NUM} >> ${SOLUTIONS10}
    tail ${DIR2}/${NUM} >> ${SOLUTIONS10}

    echo
done

cat ${COUNT} | sort -k2 -n -r | awk  '{ if ($2 != 0) print $0 }' > ${COUNTSORTED}
cat ${COUNT} | awk -F: '{ if ($2==0) print $1 }' > ${SOLUTIONSNOTFOUND}
cat ${COUNT} | awk -F: '{ if ($2!=0) print $1 }' > ${SOLUTIONSFOUND}
