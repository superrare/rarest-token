{ mkDerivation, base, generics-sop, lib, zlib, web3-ethereum }:
mkDerivation {
  pname = "rarest-token";
  version = "0.1.0.0";
  src = ./.;
  libraryHaskellDepends = [ base generics-sop web3-ethereum ];
  libraryPkgconfigDepends = [ zlib ];
  homepage = "https://github.com/Pixura/rarest-token#readme";
  license = lib.licenses.bsd3;
}
