ero,i
mov cero,mod
mov cero,cociente
bucle:cmp mod,rhs
beq mod+
vuelta_mod: cmp i,lhs
beq calcular_resto
add uno,mod
add uno,i
cmp cero,cero
beq bucle

mod+: mov cero,mod
add uno,cociente
cmp cero,cero
beq vuelta_mod

calcular_resto: hlt

i: dato 0000
mod: dato 0000
cociente: dato 0000

lhs: dato 0005
rhs: dato 0005


cero: dato 0000
uno: dato 0001



la_division_es_lhs_entre_rhs_(lhs/rhs_como_si_fuera_a/b_): hlt

el_resto_esta_en_mod: hlt
