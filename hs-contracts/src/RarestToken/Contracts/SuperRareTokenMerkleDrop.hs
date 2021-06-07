{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}

module RarestToken.Contracts.SuperRareTokenMerkleDrop where

import           Network.Ethereum.Contract.TH

[abiFrom|contracts/abis/SuperRareTokenMerkleDrop.json|]