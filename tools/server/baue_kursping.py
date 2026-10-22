#!/usr/bin/env python3
"""Baut kursping-install.sh: bettet kursping.py in die Vorlage ein."""
import os
hier = os.path.dirname(os.path.abspath(__file__))
prog = open(os.path.join(hier, 'kursping.py')).read().rstrip('\n')
assert 'KURSPING_PROGRAMM_ENDE' not in prog
vorlage = open(os.path.join(hier, 'kursping-install.vorlage.sh')).read()
open(os.path.join(hier, 'kursping-install.sh'), 'w').write(vorlage.replace('@@PROGRAMM@@', prog))
