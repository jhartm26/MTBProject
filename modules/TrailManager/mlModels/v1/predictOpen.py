import os
import re
from joblib import load

import contractions
from spellchecker import SpellChecker

import nltk
from nltk.corpus import wordnet, stopwords
from nltk.tokenize import word_tokenize, RegexpTokenizer
from nltk.stem import WordNetLemmatizer


def get_wordnet_pos(treebank_tag: str):
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return None


def preprocess(str):
    # Remove digits
    s1 = re.sub(r'\d', '', str)

    # Spelling correction
    s2 = s1.split()
    spell = SpellChecker()
    for i, el in enumerate(s2):
        corr = spell.correction(el)
        if corr is not None:
            s2[i] = corr

    # Remove whitespace
    s3 = ' '.join(s2)

    # Fix contractions
    s4 = contractions.fix(s3)

    # Remove punctuation
    puncRemover = RegexpTokenizer(r'\w+')
    s5 = ' '.join(puncRemover.tokenize(''.join(s4)))

    # Tokenize string
    s6 = word_tokenize(s5)

    # Tag parts of speech
    s7 = nltk.pos_tag(s6)

    # Lemmatize string
    lemmatizer = WordNetLemmatizer()
    s8 = []
    for item in s7:
        pos = get_wordnet_pos(item[1])
        if pos is not None:
            s8.append(lemmatizer.lemmatize(item[0], pos))
        else:
            s8.append(lemmatizer.lemmatize(item[0]))

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    include_words = ['were', 'needn', 'mightn', 'weren',
                     'out', 't', 'didn', 'mustn', "won't",
                     'hadn', 'against', 'not', 'won', 'doesn',
                     "shan't", "weren't", "wouldn't", 'hasn',
                     "haven't", 'shouldn', "wasn't", "couldn't",
                     "shouldn't", "mightn't", "hadn't", 'wasn',
                     'wouldn', 'nor', 'no', "needn't", "aren't",
                     'couldn', 'haven', "don't", 'off', "hasn't",
                     'isn', "mustn't", 'down', 'don', "didn't",
                     "isn't", 'aren', "doesn't"]
    s9 = []
    for w in s8:
        if w.lower() not in stop_words or w in include_words:
            s9.append(w)

    # Rebuild the string
    result = ' '.join(s9)
    return result.lower()


def getMaxIndex(data):
    result = -1
    currMax = -1
    for i, entry in enumerate(data):
        if entry > currMax:
            result = i
            currMax = entry
    return result


def main():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    clf = load(os.path.join(dir_path, 'openModel.joblib'))
    vectorizer = load(os.path.join(dir_path, 'openModel.vectorizer.joblib'))
    reducer = load(os.path.join(dir_path, 'openModel.reducer.joblib'))
    print('init')
    while (True):
        try:
            vec = reducer.transform(
                vectorizer.transform([preprocess(input())])
            )
            probs = clf.predict_proba(vec)
            max_index = getMaxIndex(probs[0])
            prediction = clf.classes_[max_index]
            confidence = probs[0][max_index]
            result = {
                "classList": clf.classes_,
                "probabilities": probs[0],
                "prediction": prediction,
                "confidence": confidence
            }
            print(result)
        except:
            continue


if __name__ == '__main__':
    main()
